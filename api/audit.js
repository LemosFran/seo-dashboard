const UA = "Mozilla/5.0 (compatible; AurumStudioAuditBot/1.0; +https://aurumstudio.com/bot)";
const BOT_BLOCK_STATUSES = [401, 403, 406, 429, 999];
const DOWN_TIMEOUT_MS = 8000;
const ROBOTS_TIMEOUT_MS = 4000;
const PARTIAL_THRESHOLD_MS = 6000;

async function fetchText(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: "follow", headers: { "User-Agent": UA } });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } finally {
    clearTimeout(timer);
  }
}

function robotsBlocksUs(robotsTxt) {
  let activeForAll = false;
  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.trim();
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();
    if (key === "user-agent") activeForAll = value === "*";
    if (key === "disallow" && activeForAll && value === "/") return true;
  }
  return false;
}

function detectPlatform(html) {
  const generator = (html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']*)["']/i) || [])[1];
  if (generator) return generator.trim();
  if (/wp-content|wp-includes/i.test(html)) return "WordPress";
  if (/cdn\.shopify\.com/i.test(html)) return "Shopify";
  if (/wixstatic\.com/i.test(html)) return "Wix";
  if (/static1\.squarespace\.com/i.test(html)) return "Squarespace";
  if (/webflow\.com/i.test(html)) return "Webflow";
  return null;
}

function extractSignals(html, isHttps) {
  const title = ((html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "").trim();
  const metaDesc = ((html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || [])[1] || "").trim();
  return {
    title,
    metaDesc,
    hasCanonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    hasViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    hasSchema: /application\/ld\+json/i.test(html),
    isHttps,
    platform: detectPlatform(html),
  };
}

const CHIP_LABELS = {
  es: { title: "Title Tag", meta: "Meta Desc.", canonical: "Canonical", mobile: "Mobile", https: "HTTPS", schema: "Schema",
    present: "Presente", absent: "Ausente", incomplete: "Incompleta", configured: "Configurado", noViewport: "Sin viewport", active: "Activo", inactive: "Inactivo" },
  en: { title: "Title Tag", meta: "Meta Desc.", canonical: "Canonical", mobile: "Mobile", https: "HTTPS", schema: "Schema",
    present: "Present", absent: "Missing", incomplete: "Incomplete", configured: "Configured", noViewport: "No viewport", active: "Active", inactive: "Inactive" },
};

function buildStatusChips(signals, lang) {
  const L = CHIP_LABELS[lang] || CHIP_LABELS.es;
  return [
    { key: "title", label: L.title, value: signals.title ? L.present : L.absent, status: signals.title ? "good" : "bad" },
    { key: "meta", label: L.meta, value: !signals.metaDesc ? L.absent : signals.metaDesc.length < 50 ? L.incomplete : L.present, status: !signals.metaDesc ? "bad" : signals.metaDesc.length < 50 ? "warning" : "good" },
    { key: "canonical", label: L.canonical, value: signals.hasCanonical ? L.configured : L.absent, status: signals.hasCanonical ? "good" : "bad" },
    { key: "mobile", label: L.mobile, value: signals.hasViewport ? "Responsive" : L.noViewport, status: signals.hasViewport ? "good" : "bad" },
    { key: "https", label: L.https, value: signals.isHttps ? L.active : L.inactive, status: signals.isHttps ? "good" : "bad" },
    { key: "schema", label: L.schema, value: signals.hasSchema ? L.present : L.absent, status: signals.hasSchema ? "good" : "bad" },
  ];
}

function buildPrompt({ url, langName, signals, statusChips }) {
  return `Actuá como auditor senior de SEO, contenido, performance y diseño para Aurum Studio. Generá una auditoría realista y creíble para ${url}, un sitio web de cualquier rubro — no asumas ningún rubro específico en las etiquetas de interfaz.

Estas 6 señales técnicas ya fueron medidas objetivamente por un crawl real y son la fuente de verdad — tu análisis y tu puntaje deben ser coherentes con ellas, no las repitas ni las contradigas:
${statusChips.map(c => `- ${c.label}: ${c.value} (${c.status})`).join("\n")}
Título detectado: "${signals.title || "(vacío)"}"
Meta descripción detectada: "${signals.metaDesc || "(vacía)"}"
Plataforma detectada: ${signals.platform || "no detectada, inferí la más probable"}

Devolvé SOLO un objeto JSON con este esquema exacto, todo el texto en ${langName}:
{
  "platform": "string (CMS/plataforma probable si no fue detectada, o la detectada)",
  "score": 0-100,
  "seoProblems": [{"title":"string","description":"string 1-2 frases","severity":"critical|high|medium|low"}] (6 items, orden por severidad descendente),
  "designImprovements": [{"title":"string","description":"string 1-2 frases","impactNote":"string corto de impacto de negocio"}] (5 items),
  "strategic": [{"order":"1".."4","title":"string","description":"string 1 frase"}] (4 items, oportunidades de mayor retorno comercial),
  "pageStructureRecs": [{"tag":"string corto tipo H1|NAV|IMG|CTA","problem":"string","fix":"string con la recomendación accionable"}] (4 items),
  "quickWinsSrc": [{"title":"string","description":"string corto de beneficio"}] (6 items, mejoras rápidas y de bajo esfuerzo),
  "benchmarkCompetitors": [{"name":"Sitio de referencia N (genérico, sin nombrar rubro ni marca)","score":0-100}] (4 items, sitios ficticios anonimizados comparables, con scores variados alrededor del sitio auditado)
}
Específico y creíble, sin genérico de relleno. Máximo 20 palabras por descripción corta.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, reason: "method" });

  const { url, lang = "es", forceHomeOnly = false } = req.body || {};
  const langName = lang === "en" ? "English" : "Spanish";
  if (!url) return res.status(400).json({ ok: false, reason: "bad-request" });

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ ok: false, reason: "bad-request" });
  }

  let page;
  const fetchStarted = Date.now();
  try {
    page = await fetchText(parsedUrl.toString(), DOWN_TIMEOUT_MS);
  } catch {
    return res.status(200).json({ ok: false, reason: "down" });
  }
  const fetchMs = Date.now() - fetchStarted;

  if (!page.ok && BOT_BLOCK_STATUSES.includes(page.status) && !forceHomeOnly) {
    return res.status(200).json({ ok: false, reason: "blocked-robots" });
  }
  if (!page.ok && page.status >= 500) {
    return res.status(200).json({ ok: false, reason: "down" });
  }

  if (!forceHomeOnly) {
    try {
      const robots = await fetchText(`${parsedUrl.origin}/robots.txt`, ROBOTS_TIMEOUT_MS);
      if (robots.ok && robotsBlocksUs(robots.text)) {
        return res.status(200).json({ ok: false, reason: "blocked-robots" });
      }
    } catch {
      // no robots.txt or unreachable — not itself a blocker
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ ok: false, reason: "config" });
  }

  const signals = extractSignals(page.text.slice(0, 60000), parsedUrl.protocol === "https:");
  const statusChips = buildStatusChips(signals, lang);
  const partial = fetchMs > PARTIAL_THRESHOLD_MS;

  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: "Sos un auditor senior de SEO, contenido, performance y diseño. Respondé SOLO con un objeto JSON válido, sin bloques de código ni explicación. Empezá con { y terminá con }.",
        messages: [{ role: "user", content: buildPrompt({ url: parsedUrl.toString(), langName, signals, statusChips }) }],
      }),
    });
    const aiJson = await aiRes.json();
    if (!aiRes.ok) return res.status(200).json({ ok: false, reason: "ai-error" });

    const raw = (aiJson.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const si = cleaned.indexOf("{");
    const ei = cleaned.lastIndexOf("}");
    if (si === -1 || ei === -1) return res.status(200).json({ ok: false, reason: "ai-error" });

    const parsed = JSON.parse(cleaned.slice(si, ei + 1));
    if (typeof parsed.score !== "number" || !Array.isArray(parsed.seoProblems)) {
      return res.status(200).json({ ok: false, reason: "ai-error" });
    }

    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    const site = `www.${hostname}`;
    const competitors = [
      ...(parsed.benchmarkCompetitors || []).map(c => ({ name: c.name, score: c.score, isYou: false })),
      { name: site, score: parsed.score, isYou: true },
    ];

    const data = {
      site,
      platform: signals.platform || parsed.platform || null,
      score: parsed.score,
      statusChips,
      seoProblems: parsed.seoProblems,
      designImprovements: parsed.designImprovements || [],
      strategic: parsed.strategic || [],
      pageStructureRecs: parsed.pageStructureRecs || [],
      quickWinsSrc: (parsed.quickWinsSrc || []).map((qw, i) => ({ id: `qw${i}`, title: qw.title, description: qw.description })),
      benchmarkCompetitors: competitors,
    };

    return res.status(200).json({ ok: true, partial, missingSection: partial ? "performance" : null, data });
  } catch {
    return res.status(200).json({ ok: false, reason: "ai-error" });
  }
}
