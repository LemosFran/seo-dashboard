import { useEffect, useRef, useState } from "react";

// ── Design tokens (Aurum Studio) ───────────────────────────────────────────
const DS = {
  bg: "#F5F5F5",
  black: "#1D1A1B",
  white: "#FFFFFF",
  accent: "#96FF58",
  accentInk: "#377512",
  text: "#474244",
  textMuted: "#5C5658",
  stroke: "#E8E8E8",
  secondary: "#F0FAE8",
  gridLine: "#EEEEEE",
  amber: "#C98A1F",
  scoreBad: "#C62828",
  surfaceDark: "#1D1A1B",
  fontDisplay: "'Libre Caslon Condensed', Georgia, serif",
  fontSans: "'Neue Montreal', 'Inter', sans-serif",
};

const SEVERITY = {
  critical: { label: "Critical", bg: "#FDEBEF", fg: "#D64060" },
  high: { label: "High", bg: "#FDEEE0", fg: "#C8701B" },
  medium: { label: "Medium", bg: "#FDF6DC", fg: "#9E7C15" },
  low: { label: "Low", bg: "#E8F1FD", fg: "#3C74B8" },
};
const STATUS_PILL = {
  good: { label: "Good", bg: "#EAFBE0", fg: "#3C7A2A" },
  warning: { label: "Warning", bg: "#E8F1FD", fg: "#2D6CB8" },
  bad: { label: "Bad", bg: "#FDEBEF", fg: "#C43A5A" },
};

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 6 * 60 * 60 * 1000;
const AUDIT_LOG_KEY = "aurum_audit_log";
const QUICKWINS_KEY_PREFIX = "aurum_quickwins:";

// ── Inline icon set — ported 1:1 from the design source (lucide paths) ────
function Icon({ name, size = 16, color = "currentColor", strokeWidth = 2, style }) {
  const paths = {
    check: <path d="M20 6 9 17l-5-5" />,
    "triangle-alert": (
      <>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    monitor: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </>
    ),
    zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />,
    "wifi-off": (
      <>
        <line x1="2" y1="2" x2="22" y2="22" />
        <path d="M8.5 16.5a5 5 0 0 1 7 0" />
        <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
        <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
        <path d="M16.85 11.25a10 10 0 0 1 2.14 1.5" />
        <path d="M5 12.85a10 10 0 0 1 3-1.5" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </>
    ),
    shield: <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6Z" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
    pencil: <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />,
  };
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block", ...style }}
    >
      {paths[name] || paths.check}
    </svg>
  );
}

// ── Translations ────────────────────────────────────────────────────────────
const T = {
  es: {
    aiPowered: "Potenciado con IA",
    heroTitle: "Descubrí Qué Frena El Crecimiento De Tu Sitio Web",
    heroSubtitle: "Un informe con los problemas priorizados, las oportunidades de mejora y qué hacer con cada una. Sin instalar nada, sin registro.",
    urlLabel: "URL del sitio web",
    placeholder: "https://www.tusitio.com/",
    runAudit: "Ejecutar Auditoría",
    framing: [
      { icon: "target", label: "SEO técnico" },
      { icon: "grid", label: "Estructura de página" },
      { icon: "monitor", label: "Diseño y UX" },
      { icon: "zap", label: "Performance" },
    ],
    homeFooter: "Desarrollado por AurumStudio",
    urlError: "Falta el dominio completo. Probá con https://tusitio.com",
    auditing: "Auditando",
    phases: ["Rastreando el sitio", "Analizando SEO", "Evaluando diseño", "Midiendo performance", "Redactando el informe"],
    errors: {
      down: { title: "El sitio no responde", text: "Esperamos unos segundos y no hubo respuesta. Puede estar caído o bloqueando peticiones automáticas.", primary: "Reintentar" },
      "blocked-robots": { title: "El sitio bloquea el rastreo", text: "El robots.txt no permite analizar estas páginas. Se puede auditar solo la home, o pedir al equipo del sitio que habilite el rastreo.", primary: "Auditar solo la home" },
      "rate-limit": { title: "Alcanzaste el límite de auditorías", text: (mins) => `Podés hacer ${RATE_LIMIT_MAX} auditorías cada 6 horas. El contador se reinicia en ${formatMins(mins, "es")}, o escribinos para acceso sin límite.`, primary: "Hablar con Aurum" },
    },
    backToHome: "Volver al inicio",
    partialTitle: "Análisis parcial",
    partialText: "No pudimos medir Performance (tiempo de espera agotado). El resto del informe está completo y el puntaje se calculó solo sobre las secciones disponibles.",
    auditComplete: "Auditoría completa",
    platform: "Plataforma",
    seoScore: "Puntuación",
    seoScoreLine2: "SEO",
    secSEO: "Problemas y Oportunidades SEO",
    secDesign: "Mejoras de Diseño",
    convBadge: "Enfoque comercial",
    convTitle: "Oportunidades con mayor retorno",
    secStruct: "Estructura de Página",
    secWins: "Victorias Rápidas",
    benchmarkTitle: "Comparativa con sitios del rubro",
    benchmarkSubtitle: "Score de los sitios mejor posicionados para las mismas búsquedas",
    benchmarkFootnote: "Sitios anonimizados · auditados con el mismo criterio y fecha",
    ctaTitle: "¿Querés corregir esto?",
    ctaSubtitle: "Aurum Studio implementa las correcciones de este informe. Te enviamos un presupuesto con prioridades y plazos.",
    ctaPrimary: "Solicitar presupuesto",
    ctaExport: "Exportar PDF",
    ctaShare: "Compartir",
    ctaSchedule: "Agendar llamada",
    ctaEmailLabel: "Te enviamos el informe en PDF",
    ctaEmailPlaceholder: "nombre@empresa.com",
    ctaEmailSubmit: "Enviar el informe",
    ctaEmailNote: "Un solo paso entre el click y la descarga.",
    ctaSending: "Preparando tu PDF…",
    ctaDone: "Listo — revisá tu correo.",
    methodology: "Metodología: PageSpeed Insights, CrUX, crawl propio + análisis de diseño asistido por IA.",
  },
  en: {
    aiPowered: "Powered by AI",
    heroTitle: "Discover What's Holding Your Website Back",
    heroSubtitle: "A report with prioritized issues, improvement opportunities, and what to do about each one. Nothing to install, no sign-up.",
    urlLabel: "Website URL",
    placeholder: "https://www.yourwebsite.com/",
    runAudit: "Run Audit",
    framing: [
      { icon: "target", label: "Technical SEO" },
      { icon: "grid", label: "Page structure" },
      { icon: "monitor", label: "Design & UX" },
      { icon: "zap", label: "Performance" },
    ],
    homeFooter: "Built by AurumStudio",
    urlError: "The domain looks incomplete. Try https://yoursite.com",
    auditing: "Auditing",
    phases: ["Crawling the site", "Analyzing SEO", "Evaluating design", "Measuring performance", "Writing the report"],
    errors: {
      down: { title: "The site isn't responding", text: "We waited a few seconds and got no response. It might be down or blocking automated requests.", primary: "Retry" },
      "blocked-robots": { title: "The site blocks crawling", text: "robots.txt doesn't allow analyzing these pages. You can audit just the homepage, or ask the site's team to allow crawling.", primary: "Audit homepage only" },
      "rate-limit": { title: "You've reached the audit limit", text: (mins) => `You can run ${RATE_LIMIT_MAX} audits every 6 hours. The counter resets in ${formatMins(mins, "en")}, or reach out for unlimited access.`, primary: "Talk to Aurum" },
    },
    backToHome: "Back to home",
    partialTitle: "Partial analysis",
    partialText: "We couldn't measure Performance (the request timed out). The rest of the report is complete, and the score was calculated using only the available sections.",
    auditComplete: "Audit complete",
    platform: "Platform",
    seoScore: "SEO",
    seoScoreLine2: "Score",
    secSEO: "SEO Issues & Opportunities",
    secDesign: "Design Improvements",
    convBadge: "Business focus",
    convTitle: "Highest-return opportunities",
    secStruct: "Page Structure",
    secWins: "Quick Wins",
    benchmarkTitle: "Comparison with industry sites",
    benchmarkSubtitle: "Score of the top-ranking sites for the same searches",
    benchmarkFootnote: "Sites anonymized · audited with the same criteria and date",
    ctaTitle: "Want to fix this?",
    ctaSubtitle: "Aurum Studio implements the fixes in this report. We'll send you a quote with priorities and timelines.",
    ctaPrimary: "Request a quote",
    ctaExport: "Export PDF",
    ctaShare: "Share",
    ctaSchedule: "Schedule a call",
    ctaEmailLabel: "We'll send you the PDF report",
    ctaEmailPlaceholder: "name@company.com",
    ctaEmailSubmit: "Send report",
    ctaEmailNote: "One step between the click and the download.",
    ctaSending: "Preparing your PDF…",
    ctaDone: "Done — check your email.",
    methodology: "Methodology: PageSpeed Insights, CrUX, our own crawl + AI-assisted design analysis.",
  },
};

function formatMins(mins, lang) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (lang === "es") return h > 0 ? `${h}h ${m}m` : `${m}m`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ── Fallback demo data (used only if the AI call itself fails) ────────────
function fallbackData(site) {
  return {
    site: site || "www.tusitio.com",
    platform: "WordPress",
    score: 62,
    statusChips: [
      { key: "title", label: "Title Tag", value: "Presente", status: "good" },
      { key: "meta", label: "Meta Desc.", value: "Incompleta", status: "warning" },
      { key: "canonical", label: "Canonical", value: "Configurado", status: "good" },
      { key: "mobile", label: "Mobile", value: "Responsive", status: "good" },
      { key: "https", label: "HTTPS", value: "Activo", status: "good" },
      { key: "schema", label: "Schema", value: "Ausente", status: "bad" },
    ],
    seoProblems: [
      { title: "Falta Schema Markup estructurado", description: "No hay datos estructurados JSON-LD en ninguna página.", severity: "critical" },
      { title: "Meta descripciones débiles o ausentes", description: "Varias páginas internas carecen de meta descripción única.", severity: "critical" },
      { title: "Velocidad de carga deficiente", description: "Imágenes sin comprimir y scripts bloqueantes incrementan el tiempo de carga.", severity: "high" },
      { title: "H1 duplicado o mal jerarquizado", description: "Algunas páginas tienen múltiples H1 o carecen de él.", severity: "high" },
      { title: "URLs con parámetros dinámicos", description: "Dificultan la indexación y el posicionamiento.", severity: "medium" },
      { title: "Ausencia de contenido editorial", description: "No hay sección que genere tráfico orgánico informacional.", severity: "low" },
    ],
    designImprovements: [
      { title: "Rediseñar el hero principal", description: "Falta un mensaje claro y una llamada a la acción visible.", impactNote: "Alto impacto en conversión" },
      { title: "Mejorar tipografía y contraste", description: "Contraste insuficiente en secciones grises.", impactNote: "Mejora accesibilidad" },
      { title: "Añadir testimonios visibles", description: "No hay reseñas destacadas en la página principal.", impactNote: "Incrementa credibilidad" },
      { title: "Optimizar tarjetas de producto/servicio", description: "Muestran poca información clave de forma directa.", impactNote: "Reduce clics innecesarios" },
      { title: "Agregar contacto flotante", description: "No hay botón de contacto rápido visible.", impactNote: "Aumenta leads directos" },
    ],
    strategic: [
      { order: "1", title: "Formulario destacado en el home", description: "Añadir un formulario prominente en la parte superior del inicio." },
      { order: "2", title: "Captación de leads con contenido gratuito", description: "Ofrecer un descargable a cambio del correo del usuario." },
      { order: "3", title: "Urgencia en la oferta principal", description: "Mostrar etiquetas de disponibilidad limitada para activar decisión." },
      { order: "4", title: "Herramienta de cotización o valoración", description: "Formulario simple para captar interesados calificados." },
    ],
    pageStructureRecs: [
      { tag: "H1", problem: "Texto H1 genérico o ausente en páginas internas", fix: "Crear un H1 único y descriptivo para cada página." },
      { tag: "NAV", problem: "Menú de navegación sin estructura semántica clara", fix: "Reorganizar el menú en categorías claras." },
      { tag: "IMG", problem: "Imágenes sin atributo ALT descriptivo", fix: "Añadir ALT específico a cada imagen relevante." },
      { tag: "CTA", problem: "Botones de acción con texto genérico", fix: "Reemplazar por textos accionables y específicos." },
    ],
    quickWinsSrc: [
      { id: "qw0", title: "Añadir meta descripción única a cada página", description: "Mejora inmediata del CTR en Google" },
      { id: "qw1", title: "Comprimir imágenes con WebP", description: "Reduce peso de imágenes y mejora Core Web Vitals" },
      { id: "qw2", title: "Implementar Schema Markup", description: "Activa rich snippets en los resultados de Google" },
      { id: "qw3", title: "Optimizar ficha de Google Business Profile", description: "Aumenta visibilidad en búsquedas locales" },
      { id: "qw4", title: "Añadir ALT text a todas las imágenes", description: "Mejora indexación y accesibilidad" },
      { id: "qw5", title: "Activar caché y minificación de CSS/JS", description: "Mejora el tiempo de carga" },
    ],
    benchmarkCompetitors: [
      { name: "Sitio de referencia 1", score: 78 },
      { name: "Sitio de referencia 2", score: 71 },
      { name: site || "www.tusitio.com", score: 62, isYou: true },
      { name: "Sitio de referencia 3", score: 54 },
      { name: "Sitio de referencia 4", score: 48 },
    ],
  };
}

function validateUrl(url) {
  if (!url || !/^https?:\/\/[^\s]+\.[^\s]{2,}/i.test(url.trim())) return "invalid";
  return null;
}

function scoreColorFor(score) {
  if (score < 50) return DS.scoreBad;
  if (score < 70) return DS.amber;
  return DS.accent;
}

function readRateLimitState() {
  try {
    const raw = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || "[]");
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
    return raw.filter(ts => ts > cutoff);
  } catch {
    return [];
  }
}
function logAuditRun() {
  const log = readRateLimitState();
  log.push(Date.now());
  try { localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(log)); } catch { /* ignore quota errors */ }
}
function minutesUntilReset(log) {
  if (!log.length) return 0;
  const oldest = Math.min(...log);
  const resetAt = oldest + RATE_LIMIT_WINDOW_MS;
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 60000));
}

function loadQuickWins(hostname) {
  try { return JSON.parse(localStorage.getItem(QUICKWINS_KEY_PREFIX + hostname) || "{}"); } catch { return {}; }
}
function saveQuickWins(hostname, state) {
  try { localStorage.setItem(QUICKWINS_KEY_PREFIX + hostname, JSON.stringify(state)); } catch { /* ignore quota errors */ }
}

const outlineBtn = { background: "transparent", color: "#1D1A1B", border: `1.5px solid ${DS.stroke}`, borderRadius: 999, padding: "12px 22px", fontSize: 14, fontWeight: 500, cursor: "pointer" };
const accentBtn = { background: DS.accent, color: "#1D1A1B", border: "none", borderRadius: 999, padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" };

// ── App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("es");
  const [view, setView] = useState("home");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState(null);
  const [auditUrl, setAuditUrl] = useState("");
  const [data, setData] = useState(null);
  const [quickWinsState, setQuickWinsState] = useState({});
  const [ctaStep, setCtaStep] = useState("idle");
  const [ctaEmailValue, setCtaEmailValue] = useState("");
  const [loadingPhaseIndex, setLoadingPhaseIndex] = useState(0);
  const [rateLimitMins, setRateLimitMins] = useState(0);
  const phaseTimerRef = useRef(null);
  const t = T[lang];

  useEffect(() => () => { if (phaseTimerRef.current) clearInterval(phaseTimerRef.current); }, []);

  const hostname = data ? data.site.replace(/^www\./, "") : "";

  async function runAudit(targetUrl, { forceHomeOnly = false } = {}) {
    setView("loading");
    setAuditUrl(targetUrl);
    setLoadingPhaseIndex(0);
    setCtaStep("idle");
    setCtaEmailValue("");
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    phaseTimerRef.current = setInterval(() => {
      setLoadingPhaseIndex(i => Math.min(i + 1, t.phases.length - 1));
    }, 1100);

    logAuditRun();

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, lang, forceHomeOnly }),
      });
      const json = await res.json();
      if (json.ok) {
        const site = json.data.site;
        setQuickWinsState(loadQuickWins(site.replace(/^www\./, "")));
        setData(json.data);
        setView(json.partial ? "partial" : "results");
      } else if (json.reason === "down") {
        setView("error-down");
      } else if (json.reason === "blocked-robots") {
        setView("blocked-robots");
      } else {
        const fb = fallbackData(targetUrl.replace(/^https?:\/\//, "").replace(/^www\./, m => "www."));
        setQuickWinsState(loadQuickWins(fb.site.replace(/^www\./, "")));
        setData(fb);
        setView("results");
      }
    } catch {
      setView("error-down");
    } finally {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    }
  }

  function onSubmit() {
    const err = validateUrl(url);
    if (err) { setUrlError(t.urlError); return; }
    setUrlError(null);
    let clean = url.trim();
    if (!/^https?:\/\//i.test(clean)) clean = "https://" + clean;

    const log = readRateLimitState();
    if (log.length >= RATE_LIMIT_MAX) {
      setRateLimitMins(minutesUntilReset(log));
      setView("rate-limit");
      return;
    }
    runAudit(clean);
  }

  function auditHomeOnly() { runAudit(auditUrl, { forceHomeOnly: true }); }
  function backToHome() { setView("home"); setUrl(""); setUrlError(null); }
  function retry() { runAudit(auditUrl); }

  function toggleQuickWin(id) {
    setQuickWinsState(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (hostname) saveQuickWins(hostname, next);
      return next;
    });
  }

  function startPdfFlow() { setCtaStep("email"); }
  function submitCtaEmail() {
    if (!ctaEmailValue || !/@/.test(ctaEmailValue)) return;
    setCtaStep("sending");
    setTimeout(() => setCtaStep("done"), 1200);
  }

  const isResultsLike = view === "results" || view === "partial";
  const isErrorLike = view === "error-down" || view === "blocked-robots" || view === "rate-limit";

  const errorDefs = {
    down: { icon: "wifi-off", ...t.errors.down, action: retry },
    "blocked-robots": { icon: "shield", ...t.errors["blocked-robots"], action: auditHomeOnly },
    "rate-limit": { icon: "clock", title: t.errors["rate-limit"].title, text: t.errors["rate-limit"].text(rateLimitMins), primary: t.errors["rate-limit"].primary, action: backToHome },
  };
  const errorKey = view === "error-down" ? "down" : view;
  const errorDef = errorDefs[errorKey];

  const scoreColor = data ? scoreColorFor(data.score) : DS.accent;
  const gaugePct = data ? Math.max(0, Math.min(1, data.score / 100)) : 0;
  const competitors = data?.benchmarkCompetitors || [];
  const hasBenchmark = competitors.length > 0;
  const maxScore = Math.max(...competitors.map(b => b.score), 1);
  const benchmarkRows = competitors.slice().sort((a, b) => b.score - a.score);
  const quickWinsDone = Object.values(quickWinsState).filter(Boolean).length;
  const quickWinsTotal = data?.quickWinsSrc?.length || 0;

  return (
    <div style={{ fontFamily: DS.fontSans, color: DS.text, background: DS.bg, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.bunny.net/css?family=neue-montreal:400,500,600,700&display=swap');
        *{box-sizing:border-box;}
        body{margin:0;}
        a{color:${DS.accentInk};text-decoration:none;}
        a:hover{color:${DS.black};text-decoration:underline;}
        ::selection{background:${DS.accent};color:${DS.black};}
        input:focus-visible,button:focus-visible,a:focus-visible{outline:2px solid ${DS.accentInk};outline-offset:2px;}
        .aurum-framing{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:26px;}
        @media (max-width:640px){.aurum-framing{grid-template-columns:repeat(2,1fr);}}
        @media (max-width:420px){.aurum-framing{grid-template-columns:1fr;}}
        .aurum-benchmark-row{display:flex;align-items:center;gap:16px;}
        @media (max-width:560px){.aurum-benchmark-row{flex-direction:column;align-items:flex-start;gap:6px;}.aurum-benchmark-row .aurum-bm-name{width:auto !important;}.aurum-benchmark-row .aurum-bm-bar{width:100%;}}
        .aurum-cta-actions{display:flex;gap:11px;justify-content:center;flex-wrap:wrap;align-items:center;}
        @media (max-width:480px){.aurum-cta-actions{flex-direction:column;width:100%;}.aurum-cta-actions button{width:100%;}}
      `}</style>

      {/* NAVBAR */}
      <div style={{ background: DS.black }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: DS.accent }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>SEO &amp; Design Audit</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>AI-powered analysis</div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", borderLeft: "1px solid rgba(255,255,255,0.15)", paddingLeft: 12, marginLeft: 2 }}>By Aurum Studio</div>
          </div>
          <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.08)", borderRadius: 999, padding: 3 }}>
            <button onClick={() => setLang("es")} style={{ background: lang === "es" ? DS.accent : "transparent", color: lang === "es" ? "#1D1A1B" : "rgba(255,255,255,0.5)", border: "none", borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>ES</button>
            <button onClick={() => setLang("en")} style={{ background: lang === "en" ? DS.accent : "transparent", color: lang === "en" ? "#1D1A1B" : "rgba(255,255,255,0.5)", border: "none", borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: lang === "en" ? 600 : 400, cursor: "pointer" }}>EN</button>
          </div>
        </div>
      </div>

      {/* HOME */}
      {view === "home" && (
        <>
          <div style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 20px", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between", padding: "0 8%", pointerEvents: "none" }}>
              <div style={{ width: 1, background: DS.gridLine }} />
              <div style={{ width: 1, background: DS.gridLine }} />
            </div>
            <div style={{ position: "relative", maxWidth: 600, width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ textAlign: "center", position: "relative" }}>
                <span style={{ display: "inline-block", background: DS.secondary, color: "#5C5658", fontSize: 13, fontWeight: 400, padding: "6px 16px", borderRadius: 999, marginBottom: 20 }}>{t.aiPowered}</span>
                <div style={{ fontFamily: DS.fontDisplay, fontStyle: "italic", fontWeight: 400, fontSize: 44, lineHeight: 1.1, color: "#1D1A1B", letterSpacing: "-0.01em", marginBottom: 20 }}>{t.heroTitle}</div>
                <div style={{ fontSize: 16, lineHeight: 1.6, color: "#5C5658", maxWidth: 440, margin: "0 auto 36px" }}>{t.heroSubtitle}</div>
              </div>
              <div style={{ background: "#fff", border: `1px solid ${DS.stroke}`, borderRadius: 12, boxShadow: "0 1px 3px rgba(29,26,27,0.06), 0 4px 16px rgba(29,26,27,0.04)", padding: 36 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5C5658", marginBottom: 10 }}>{t.urlLabel}</div>
                <input
                  type="text" placeholder={t.placeholder} value={url}
                  onChange={e => { setUrl(e.target.value); setUrlError(null); }}
                  onKeyDown={e => e.key === "Enter" && onSubmit()}
                  style={{ width: "100%", padding: "14px 16px", border: `1.5px solid ${urlError ? DS.scoreBad : DS.stroke}`, borderRadius: 8, fontSize: 15, fontFamily: DS.fontSans, color: "#1D1A1B", background: DS.bg, marginBottom: 8 }}
                />
                {urlError && <div style={{ fontSize: 12, color: "#C62828", marginBottom: 8 }}>{urlError}</div>}
                <button onClick={onSubmit} style={{ width: "100%", marginTop: 8, background: DS.accent, color: "#1D1A1B", border: "none", borderRadius: 4, padding: "14px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>{t.runAudit}</button>
              </div>
              <div className="aurum-framing">
                {t.framing.map(fi => (
                  <div key={fi.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
                    <Icon name={fi.icon} size={20} color="#1D1A1B" />
                    <div style={{ fontSize: 13, color: "#474244" }}>{fi.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ padding: "24px 48px", textAlign: "center", fontSize: 12, color: "#5C5658" }}>{t.homeFooter}</div>
        </>
      )}

      {/* LOADING */}
      {view === "loading" && (
        <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
          <div style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ textAlign: "center", fontSize: 14, color: "#474244" }}>{t.auditing} <span style={{ fontWeight: 600, color: "#1D1A1B" }}>{auditUrl}</span></div>
            <div style={{ height: 6, borderRadius: 999, background: DS.stroke, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(Math.min(loadingPhaseIndex, t.phases.length - 1) / (t.phases.length - 1)) * 100}%`, background: DS.accent, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {t.phases.map((label, i) => {
                const done = i < loadingPhaseIndex;
                const current = i === loadingPhaseIndex;
                return (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "rgba(150,255,88,0.20)" : "transparent", border: current ? `2px solid ${DS.accent}` : done ? "none" : `1.5px solid ${DS.stroke}` }}>
                      {done && <Icon name="check" size={14} color={DS.accentInk} />}
                    </div>
                    <div style={{ fontSize: 13, color: done || current ? "#1D1A1B" : "#5C5658", fontWeight: current ? 600 : 400 }}>{label}{current ? "…" : ""}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ERROR-LIKE */}
      {isErrorLike && errorDef && (
        <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
          <div style={{ maxWidth: 440, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FDEDED", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={errorDef.icon} size={24} color="#C62828" />
            </div>
            <div style={{ fontSize: 19, fontWeight: 600, color: "#1D1A1B" }}>{errorDef.title}</div>
            <div style={{ fontSize: 14, color: "#5C5658", lineHeight: 1.5 }}>{errorDef.text}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
              <button onClick={errorDef.action} style={view === "rate-limit" ? accentBtn : outlineBtn}>{errorDef.primary}</button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS / PARTIAL */}
      {isResultsLike && data && (
        <>
          {view === "partial" && (
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 48px 0" }}>
              <div style={{ background: "#FDF3E7", border: "1px solid #E86A1C", borderRadius: 8, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, marginTop: 1 }}><Icon name="triangle-alert" size={20} color="#E86A1C" /></div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1D1A1B" }}>{t.partialTitle}</div>
                  <div style={{ fontSize: 13, color: "#474244", marginTop: 4, lineHeight: 1.5 }}>{t.partialText}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 48px 0" }}>
            <div style={{ background: "#fff", border: `1px solid ${DS.stroke}`, borderRadius: 12, boxShadow: "0 1px 3px rgba(29,26,27,0.06), 0 4px 16px rgba(29,26,27,0.04)", padding: "24px 28px", display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5C5658", marginBottom: 8 }}>{t.urlLabel}</div>
                <input
                  type="text" value={url} placeholder={data.site} onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && onSubmit()}
                  style={{ width: "100%", padding: "12px 16px", border: `1.5px solid ${DS.stroke}`, borderRadius: 8, fontSize: 14, fontFamily: DS.fontSans, color: "#1D1A1B", background: DS.bg }}
                />
              </div>
              <button onClick={onSubmit} style={{ background: DS.accent, color: "#1D1A1B", border: "none", borderRadius: 4, padding: "13px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{t.runAudit}</button>
            </div>
          </div>

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 48px 0" }}>
            <div style={{ background: DS.surfaceDark, borderRadius: 12, padding: "28px 30px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 9.5, letterSpacing: "0.11em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{t.auditComplete}</div>
                <div style={{ fontFamily: DS.fontDisplay, fontStyle: "italic", fontWeight: 400, fontSize: 27, color: "#fff", marginTop: 9, letterSpacing: "-0.01em" }}>{data.site}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 7 }}>{t.platform}: <span style={{ color: "#fff", fontWeight: 600 }}>{data.platform || "—"}</span></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0, background: "#232021", border: `1px solid ${scoreColor}`, borderRadius: 11, padding: "13px 20px" }}>
                <div style={{ width: 88, height: 88, borderRadius: "50%", flexShrink: 0, background: `conic-gradient(${scoreColor} ${Math.round(gaugePct * 360)}deg, #332F30 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }} aria-hidden="true">
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#232021", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                    <div style={{ fontSize: 25, fontWeight: 700, color: scoreColor, lineHeight: 1, letterSpacing: "-0.02em" }}>
                      {data.score}
                      <span style={{ display: "block", fontSize: 8.5, color: "rgba(255,255,255,0.45)", fontWeight: 400, marginTop: 2 }}>/ 100</span>
                    </div>
                  </div>
                </div>
                <div style={{ width: 1, height: 38, background: "#3D3A3B" }} />
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "#fff", lineHeight: 1.35 }}>{t.seoScore}<br />{t.seoScoreLine2}</div>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 48px 0", display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
            {data.statusChips.map(sc => {
              const pill = STATUS_PILL[sc.status] || STATUS_PILL.good;
              return (
                <div key={sc.key} style={{ background: "#fff", border: `1px solid ${DS.stroke}`, borderRadius: 11, padding: "14px 15px" }}>
                  <div style={{ fontSize: 10.5, color: "#8F8B87", marginBottom: 5 }}>{sc.label}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1D1A1B", marginBottom: 10 }}>{sc.value}</div>
                  <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: pill.bg, color: pill.fg }}>{pill.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 48px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#fff", border: `1px solid ${DS.stroke}`, borderRadius: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 24px", borderBottom: `1px solid ${DS.stroke}` }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: DS.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="info" size={13} color="#1D1A1B" /></div>
                <div style={{ fontFamily: DS.fontDisplay, fontStyle: "italic", fontSize: 16.5, color: "#1D1A1B" }}>{t.secSEO}</div>
              </div>
              {data.seoProblems.map((p, i) => {
                const sev = SEVERITY[p.severity] || SEVERITY.low;
                return (
                  <div key={i} style={{ padding: "17px 24px", borderBottom: "1px solid #F0EFEC", display: "flex", gap: 14 }}>
                    <div style={{ flexShrink: 0, width: 72 }}><span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "3.5px 9px", borderRadius: 20, background: sev.bg, color: sev.fg }}>{sev.label}</span></div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1D1A1B", marginBottom: 5, lineHeight: 1.4 }}>{p.title}</div>
                      <div style={{ fontSize: 12.5, color: "#5C5658", lineHeight: 1.55 }}>{p.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#fff", border: `1px solid ${DS.stroke}`, borderRadius: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 24px", borderBottom: `1px solid ${DS.stroke}` }}>
                <div style={{ width: 32, height: 24, borderRadius: "50%", background: DS.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="pencil" size={13} color="#1D1A1B" /></div>
                <div style={{ fontFamily: DS.fontDisplay, fontStyle: "italic", fontSize: 16.5, color: "#1D1A1B" }}>{t.secDesign}</div>
              </div>
              {data.designImprovements.map((d, i) => (
                <div key={i} style={{ padding: "17px 24px", borderBottom: "1px solid #F0EFEC" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1D1A1B", marginBottom: 5, lineHeight: 1.4 }}>{d.title}</div>
                  <div style={{ fontSize: 12.5, color: "#5C5658", lineHeight: 1.55 }}>{d.description}</div>
                  {d.impactNote && <span style={{ display: "inline-block", marginTop: 10, background: "#EAFBE0", color: "#2E6B1F", fontSize: 10.5, fontWeight: 600, padding: "4px 10px", borderRadius: 5 }}>↑ {d.impactNote}</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 48px 0" }}>
            <div style={{ background: DS.black, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 26px", borderBottom: "1px solid #2B2829" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: DS.accent, color: "#1D1A1B", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 999 }}><Icon name="zap" size={11} color="#1D1A1B" /> {t.convBadge}</span>
                <div style={{ fontFamily: DS.fontDisplay, fontStyle: "italic", fontSize: 18, color: "#fff" }}>{t.convTitle}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {data.strategic.map((sg, i) => {
                  const numRows = Math.ceil(data.strategic.length / 2);
                  const row = Math.floor(i / 2);
                  const col = i % 2;
                  return (
                    <div key={i} style={{ padding: "22px 26px", display: "flex", gap: 14, borderBottom: row < numRows - 1 ? "1px solid #2B2829" : "none", borderRight: col === 0 ? "1px solid #2B2829" : "none" }}>
                      <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 5, background: DS.accent, color: "#1D1A1B", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{sg.order || i + 1}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", marginBottom: 5, lineHeight: 1.4 }}>{sg.title}</div>
                        <div style={{ fontSize: 12.5, color: "#918D8B", lineHeight: 1.55 }}>{sg.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 48px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#fff", border: `1px solid ${DS.stroke}`, borderRadius: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 24px", borderBottom: `1px solid ${DS.stroke}` }}>
                <div style={{ width: 32, height: 24, borderRadius: "50%", background: DS.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="settings" size={13} color="#1D1A1B" /></div>
                <div style={{ fontFamily: DS.fontDisplay, fontStyle: "italic", fontSize: 16.5, color: "#1D1A1B" }}>{t.secStruct}</div>
              </div>
              {data.pageStructureRecs.map((r, i) => (
                <div key={i} style={{ padding: "17px 24px", borderBottom: "1px solid #F0EFEC" }}>
                  <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, fontFamily: "monospace", fontSize: 10, fontWeight: 500, color: "#6E6A68", background: "#F0EFEC", borderRadius: 4, padding: "4px 7px", minWidth: 38, textAlign: "center" }}>{r.tag}</span>
                    <div style={{ fontSize: 13, color: "#1D1A1B", lineHeight: 1.5, fontWeight: 500 }}>{r.problem}</div>
                  </div>
                  <div style={{ marginTop: 9, paddingLeft: 51, display: "flex", gap: 8, fontSize: 12.5, lineHeight: 1.55, color: DS.accentInk, fontWeight: 500 }}>
                    <span>→</span><b style={{ fontWeight: 600 }}>{r.fix}</b>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", border: `1px solid ${DS.stroke}`, borderRadius: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 24px", borderBottom: `1px solid ${DS.stroke}` }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: DS.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="zap" size={13} color="#1D1A1B" /></div>
                <div style={{ fontFamily: DS.fontDisplay, fontStyle: "italic", fontSize: 16.5, color: "#1D1A1B", flex: 1 }}>{t.secWins}</div>
                {quickWinsTotal > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#3C7A2A", background: "#EAFBE0", padding: "3px 9px", borderRadius: 999 }}>{quickWinsDone}/{quickWinsTotal}</span>
                )}
              </div>
              {data.quickWinsSrc.map(qw => {
                const done = !!quickWinsState[qw.id];
                return (
                  <label key={qw.id} style={{ padding: "16px 24px", borderBottom: "1px solid #F0EFEC", display: "flex", gap: 13, cursor: "pointer" }}>
                    <input type="checkbox" checked={done} onChange={() => toggleQuickWin(qw.id)} style={{ position: "absolute", opacity: 0, width: 15, height: 15, marginTop: 2 }} />
                    <div style={{ flexShrink: 0, width: 15, height: 15, marginTop: 2, borderRadius: 4, border: done ? "none" : "1.5px solid #CFCDC9", background: done ? DS.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1D1A1B", marginBottom: 4, lineHeight: 1.45, textDecoration: done ? "line-through" : "none" }}>{qw.title}</div>
                      <div style={{ fontSize: 12, color: "#5C5658", lineHeight: 1.5 }}>{qw.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {hasBenchmark && (
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 48px 0" }}>
              <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "#474244", fontWeight: 500, marginBottom: 6 }}>{t.benchmarkTitle}</div>
              <div style={{ fontSize: 12, color: "#5C5658", marginBottom: 24 }}>{t.benchmarkSubtitle}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {benchmarkRows.map((br, i) => (
                  <div key={i} className="aurum-benchmark-row">
                    <div className="aurum-bm-name" style={{ width: 170, fontSize: 13, fontWeight: br.isYou ? 600 : 400, color: "#1D1A1B", flexShrink: 0 }}>{br.name}</div>
                    <div className="aurum-bm-bar" style={{ flex: 1, height: 22, background: "#F1EFE8", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(br.score / maxScore) * 100}%`, background: br.isYou ? DS.accent : "#B4B2A9", borderRadius: 4 }} />
                    </div>
                    <div style={{ width: 32, fontFamily: "monospace", fontSize: 13, color: "#1D1A1B", textAlign: "right" }}>{br.score}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#5C5658", marginTop: 14 }}>{t.benchmarkFootnote}</div>
            </div>
          )}

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px 0" }}>
            <div style={{ position: "relative", overflow: "hidden", borderRadius: 12, padding: "40px 30px", textAlign: "center", color: "#fff", backgroundColor: "#398EDFEB" }}>
              <img src="/nube-izquierda.png" alt="" style={{ position: "absolute", left: -150, width: "42%", pointerEvents: "none", top: -14 }} />
              <img src="/nube-derecha.png" alt="" style={{ position: "absolute", width: "42%", pointerEvents: "none", left: 634, top: 48 }} />
              <div style={{ fontFamily: DS.fontDisplay, fontStyle: "italic", fontWeight: 400, fontSize: 27, marginBottom: 9, lineHeight: 1.15, position: "relative" }}>{t.ctaTitle}</div>
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", marginBottom: 24, lineHeight: 1.6, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>{t.ctaSubtitle}</div>

                {ctaStep === "idle" && (
                  <div className="aurum-cta-actions">
                    <button onClick={startPdfFlow} style={{ background: DS.accent, color: "#1D1A1B", border: "none", borderRadius: 4, padding: "13px 26px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>{t.ctaPrimary}</button>
                    <button onClick={startPdfFlow} style={{ background: "#1D1A1B", color: "#fff", border: "none", borderRadius: 999, padding: "12px 19px", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>{t.ctaExport}</button>
                    <button style={{ background: "#1D1A1B", color: "#fff", border: "none", borderRadius: 999, padding: "12px 19px", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>{t.ctaShare}</button>
                    <button style={{ background: "#1D1A1B", color: "#fff", border: "none", borderRadius: 999, padding: "12px 19px", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>{t.ctaSchedule}</button>
                  </div>
                )}
                {ctaStep === "email" && (
                  <div style={{ maxWidth: 400, margin: "0 auto" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)", marginBottom: 10, textAlign: "left" }}>{t.ctaEmailLabel}</div>
                    <input
                      type="text" placeholder={t.ctaEmailPlaceholder} value={ctaEmailValue}
                      onChange={e => setCtaEmailValue(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && submitCtaEmail()}
                      style={{ width: "100%", padding: "13px 16px", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 9, fontSize: 14, background: "rgba(255,255,255,0.15)", color: "#fff", marginBottom: 9 }}
                    />
                    <button onClick={submitCtaEmail} style={{ width: "100%", background: "#1D1A1B", color: "#fff", border: "none", borderRadius: 999, padding: "13px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{t.ctaEmailSubmit}</button>
                    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", marginTop: 9, lineHeight: 1.5 }}>{t.ctaEmailNote}</div>
                  </div>
                )}
                {ctaStep === "sending" && <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{t.ctaSending}</div>}
                {ctaStep === "done" && <div style={{ fontSize: 14, color: "#1D1A1B", fontWeight: 700, background: DS.accent, display: "inline-block", padding: "6px 16px", borderRadius: 999 }}>{t.ctaDone}</div>}
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: 48, marginTop: 16, borderTop: `1px solid ${DS.stroke}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 12, color: "#5C5658" }}>{t.methodology}</div>
            <div style={{ fontSize: 12, color: "#5C5658" }}>v3.0</div>
          </div>
        </>
      )}
    </div>
  );
}
