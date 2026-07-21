import { useState } from "react";
import {
  ArrowRight,
  Check,
  GlobeSimple,
  Lightning,
  MagnifyingGlass,
} from "@phosphor-icons/react";

// ── Aurum Studio Design Tokens ─────────────────────────────────────────────
const DS = {
  // Colors
  bg:          "#F5F5F5",
  black:       "#1D1A1B",
  white:       "#FFFFFF",
  accent:      "#96FF58",
  text:        "#474244",
  stroke:      "#E8E8E8",
  lightGreen:  "#D8F5C4",
  secondary:   "#F0FAE8",
  red:         "#FF2244",
  cardDark:    "#242122",

  // Text
  textPrimary:     "#1D1A1B",
  textSecondary:   "#474244",
  textOnDark:      "#FFFFFF",
  textOnDarkMuted: "rgba(255,255,255,0.60)",
  textOnDarkSubtle:"rgba(255,255,255,0.30)",
  textAccent:      "#96FF58",

  // Accent scale
  accent06: "rgba(150,255,88,0.06)",
  accent10: "rgba(150,255,88,0.10)",
  accent12: "rgba(150,255,88,0.12)",
  accent14: "rgba(150,255,88,0.14)",
  accent20: "rgba(150,255,88,0.20)",
  accent24: "#F0FAE8",
  accent35: "rgba(150,255,88,0.35)",
  accent45: "rgba(150,255,88,0.45)",

  // Border
  borderDefault:      "#E8E8E8",
  borderAccent:       "rgba(150,255,88,0.24)",
  borderAccentStrong: "rgba(150,255,88,0.40)",

  // Shadows
  shadowCard:  "0 1px 3px rgba(29,26,27,0.06), 0 4px 16px rgba(29,26,27,0.04)",
  shadowFloat: "0 32px 80px rgba(0,0,0,0.45)",

  // Border radius
  radSm:   "6px",
  radMd:   "8px",
  radCard: "12px",
  radLg:   "16px",
  radXl:   "20px",
  rad2xl:  "24px",
  radPill: "50px",
  radFull: "64px",

  // Typography
  fontDisplay:  "'Neue Montreal', system-ui, sans-serif",
  fontHeading: "'Libre Caslon Condensed', Georgia, serif",
  fontUI:      "'Neue Montreal', system-ui, sans-serif",
  fontBody:    "'Neue Montreal', system-ui, sans-serif",
};

// ── Status / Priority color maps (adapted to Aurum palette) ───────────────
const statusMap = {
  good: { color: "#2D7A1F", bg: DS.lightGreen,  bd: "#B8E8A0" },
  warn: { color: "#7A5A00", bg: "#FFF8E0",       bd: "#F0DC8C" },
  bad:  { color: DS.red,    bg: "#FFE8EC",       bd: "#FFB3BF" },
  info: { color: "#1A4A7A", bg: "#E8F0FA",       bd: "#B3CCEE" },
};
const priMap = {
  critical: { color: DS.red,    bg: "#FFE8EC", bd: "#FFB3BF" },
  high:     { color: "#C04A00", bg: "#FFF0E8", bd: "#F0C4A0" },
  medium:   { color: "#7A5A00", bg: "#FFF8E0", bd: "#F0DC8C" },
  low:      { color: "#1A4A7A", bg: "#E8F0FA", bd: "#B3CCEE" },
};

function Chip({ type = "status", value }) {
  const map  = type === "priority" ? priMap : statusMap;
  const meta = map[(value || "info").toLowerCase()] || map.info;
  return (
    <span style={{
      background: meta.bg, color: meta.color,
      border: `1px solid ${meta.bd}`,
      fontSize: 11, fontWeight: 600,
      padding: "3px 10px", borderRadius: DS.radPill,
      whiteSpace: "nowrap", textTransform: "capitalize",
      fontFamily: DS.fontUI, letterSpacing: "0.02em",
    }}>{value}</span>
  );
}

function scoreColor(score, override) {
  // Brighter tones keep the score legible against the dark report header.
  if (override === "green"  || score >= 80) return "#96FF58";
  if (override === "yellow" || score >= 50) return "#FFD166";
  return "#FF7083";
}

// ── Reusable layout pieces ────────────────────────────────────────────────
const LightCard = ({ children, style = {} }) => (
  <div style={{
    background: DS.white, borderRadius: DS.radCard,
    boxShadow: DS.shadowCard, border: `1px solid ${DS.stroke}`,
    ...style,
  }}>{children}</div>
);

const DarkCard = ({ children, style = {} }) => (
  <div style={{
    background: DS.cardDark, borderRadius: DS.radCard,
    border: `1px solid ${DS.accent10}`,
    ...style,
  }}>{children}</div>
);

const SecHead = ({ children, light = true, accent = false }) => (
  <div style={{
    padding: "14px 20px",
    borderBottom: `1px solid ${light ? DS.stroke : DS.accent10}`,
    display: "flex", alignItems: "center", gap: 8,
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: "50%",
      background: accent ? DS.accent : (light ? DS.black : DS.textOnDarkMuted),
      flexShrink: 0, display: "inline-block",
    }}/>
    <span style={{
      fontSize: 15, fontWeight: 600, fontStyle: "italic", letterSpacing: "-0.01em",
      fontFamily: DS.fontHeading,
      color: light ? DS.textPrimary : DS.textOnDark,
    }}>{children}</span>
  </div>
);

const MonoTag = ({ children }) => (
  <span style={{
    fontSize: 10, fontWeight: 700, padding: "2px 7px",
    borderRadius: DS.radSm,
    background: DS.accent12, color: DS.black,
    fontFamily: "monospace", border: `1px solid ${DS.accent24}`,
  }}>{children}</span>
);

// ── Translations ──────────────────────────────────────────────────────────
const T = {
  en: {
    headerSub: "AI-powered SEO analysis",
    inputLabel: "Website URL",
    placeholder: "https://www.yourwebsite.com",
    btnRun: "Run Audit", btnRunning: "Analyzing…",
    steps: ["Analyzing domain & platform","Auditing SEO signals","Reviewing design & structure","Identifying conversion gaps","Compiling recommendations"],
    loading: "Running audit…",
    emptyTitle: "Analyze any website",
    emptyDesc: "Enter a URL and get a full SEO audit with prioritized recommendations, design feedback, and conversion opportunities.",
    platform: "Platform", auditDone: "Audit complete", score: "SEO Score", outOf: "/ 100",
    secSEO: "SEO Issues & Opportunities", secDesign: "Design Improvements",
    convBadge: "Conversion Focus", convTitle: "Revenue-Driving Improvement Opportunities",
    secStruct: "Page Structure", secWins: "Quick Wins",
    footer: "Built by AurumStudio",
    promptLang: "English",
  },
  es: {
    headerSub: "Análisis SEO con inteligencia artificial",
    inputLabel: "URL del sitio web",
    placeholder: "https://www.tusitio.com",
    btnRun: "Ejecutar Auditoría", btnRunning: "Analizando…",
    steps: ["Analizando dominio y plataforma","Auditando señales SEO","Revisando diseño y estructura","Identificando brechas de conversión","Compilando recomendaciones"],
    loading: "Ejecutando auditoría…",
    emptyTitle: "Analizá cualquier sitio web",
    emptyDesc: "Ingresá una URL y obtené una auditoría SEO completa con recomendaciones priorizadas, mejoras de diseño y oportunidades de conversión.",
    platform: "Plataforma", auditDone: "Auditoría completa", score: "Puntuación SEO", outOf: "/ 100",
    secSEO: "Problemas y Oportunidades SEO", secDesign: "Mejoras de Diseño",
    convBadge: "Enfoque en Conversión", convTitle: "Oportunidades que Generan Ingresos",
    secStruct: "Estructura de Página", secWins: "Victorias Rápidas",
    footer: "Desarrollado por AurumStudio",
    promptLang: "Spanish",
  },
};

const PROMPT = (url, lang) =>
`You are a senior SEO specialist and conversion expert. Audit this website: ${url}

Respond with ONLY a valid JSON object. No markdown, no code fences, no explanation. Start with { and end with }.
All user-facing text fields must be written in ${lang}.

{
  "platform": "detected CMS",
  "overall_score": 68,
  "score_color": "yellow",
  "metrics": [
    {"label":"Title Tag","value":"Present","status":"good"},
    {"label":"Meta Desc.","value":"Missing","status":"bad"},
    {"label":"Canonical","value":"Set","status":"good"},
    {"label":"Mobile","value":"Responsive","status":"good"},
    {"label":"HTTPS","value":"Active","status":"good"},
    {"label":"Schema","value":"None","status":"bad"}
  ],
  "seo_issues":[
    {"priority":"critical","title":"...","description":"..."},
    {"priority":"high","title":"...","description":"..."},
    {"priority":"high","title":"...","description":"..."},
    {"priority":"medium","title":"...","description":"..."},
    {"priority":"medium","title":"...","description":"..."},
    {"priority":"low","title":"...","description":"..."}
  ],
  "design_improvements":[
    {"title":"...","description":"...","impact":"..."},
    {"title":"...","description":"...","impact":"..."},
    {"title":"...","description":"...","impact":"..."},
    {"title":"...","description":"...","impact":"..."},
    {"title":"...","description":"...","impact":"..."}
  ],
  "structure_issues":[
    {"tag":"H1","text":"...","fix":"..."},
    {"tag":"NAV","text":"...","fix":"..."},
    {"tag":"IMG","text":"...","fix":"..."},
    {"tag":"CTA","text":"...","fix":"..."}
  ],
  "conversion_opportunities":[
    {"title":"...","description":"..."},
    {"title":"...","description":"..."},
    {"title":"...","description":"..."},
    {"title":"...","description":"..."}
  ],
  "quick_wins":[
    {"title":"...","sub":"..."},
    {"title":"...","sub":"..."},
    {"title":"...","sub":"..."},
    {"title":"...","sub":"..."},
    {"title":"...","sub":"..."},
    {"title":"...","sub":"..."}
  ]
}

Rules: overall_score 0-100. score_color: green(80+)/yellow(50-79)/red(<50). Be SPECIFIC to ${url}. Max 20 words per description. Return ONLY the JSON.`;

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang]     = useState("en");
  const [url, setUrl]       = useState("");
  const [status, setStatus] = useState("idle");
  const [data, setData]     = useState(null);
  const [error, setError]   = useState("");
  const [step, setStep]     = useState(0);
  const [checks, setChecks] = useState({});
  const t = T[lang];

  async function runAudit() {
    let clean = url.trim();
    if (!clean) return;
    if (!clean.startsWith("http")) clean = "https://" + clean;
    setStatus("loading"); setError(""); setData(null); setStep(0); setChecks({});
    const ticker = setInterval(() => setStep(i => Math.min(i + 1, t.steps.length - 1)), 1800);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          system: "You are an SEO expert. Respond ONLY with a raw JSON object. No markdown fences, no explanation. Start with { and end with }.",
          messages: [{ role: "user", content: PROMPT(clean, t.promptLang) }]
        })
      });
      clearInterval(ticker);
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `HTTP ${res.status}`); }
      const json = await res.json();
      const raw  = (json.content || []).filter(b => b.type === "text").map(b => b.text).join("") || JSON.stringify(json);
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
      const si = cleaned.indexOf("{"), ei = cleaned.lastIndexOf("}");
      let parsed = null;
      if (si !== -1 && ei !== -1) { try { parsed = JSON.parse(cleaned.slice(si, ei + 1)); } catch (_) {} }
      if (!parsed) throw new Error(`Raw response: ${raw.slice(0, 500)}`);
      setData({ ...parsed, url: clean });
      setStatus("done");
    } catch (err) {
      clearInterval(ticker);
      setError(err.message || "Something went wrong.");
      setStatus("error");
    }
  }

  const toggleCheck = i => setChecks(p => ({ ...p, [i]: !p[i] }));
  const hostname = (() => { try { return new URL(data?.url || url).hostname; } catch (_) { return data?.url || url; } })();
  const sc = data ? scoreColor(data.overall_score, data.score_color) : DS.accent;

  return (
    <div style={{ background: DS.bg, minHeight: "100vh", fontFamily: DS.fontUI, color: DS.textPrimary, lineHeight: 1.6 }}>
      <style>{`
        @import url('https://fonts.bunny.net/css?family=neue-montreal:400,500,600,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp .3s cubic-bezier(.4,0,.2,1); }
        .run-btn:hover:not(:disabled) { background: #7de040 !important; transform: translateY(-1px); }
        .run-btn:active { transform: translateY(0) !important; }
        .run-btn:disabled { opacity: .5; cursor: not-allowed; }
        .lang-btn:hover { opacity: .8; }
        .win-row:hover { background: ${DS.secondary} !important; }
        .url-input:focus { outline: none; border-color: ${DS.accent} !important; box-shadow: 0 0 0 3px ${DS.accent12} !important; }
        .grid-6   { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; margin-bottom:16px; }
        .grid-2   { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
        .grid-conv { display:grid; grid-template-columns:1fr 1fr; }
        .input-row { display:flex; gap:10px; }
        @media (max-width: 760px) {
          .grid-6  { grid-template-columns: repeat(3,1fr) !important; }
          .grid-2  { grid-template-columns: 1fr !important; }
          .grid-conv { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 440px) {
          .grid-6  { grid-template-columns: repeat(2,1fr) !important; }
          .input-row { flex-direction: column !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: DS.black, borderBottom: `1px solid ${DS.accent10}`,
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 9999, gap: 12,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

          <div style={{
            width: 30, height: 30, background: DS.accent24, borderRadius: DS.radSm,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: DS.black, flexShrink: 0,
          }}>
            <MagnifyingGlass size={16} weight="bold" />
          </div>
          
          <div id="logo-meta">
            <div style={{ fontSize: 16, fontWeight: 600, color: DS.textOnDark, fontFamily: DS.fontDisplay, letterSpacing: "-0.02em", height: 20 }}>
              SEO & DESIGN <span style={{ color: DS.accent }}>Audit</span>
            </div>

            <div style={{ fontSize: 11, color: DS.textOnDarkMuted, fontFamily: DS.fontUI, height: 16
             }}>{t.headerSub}</div>

          </div>
        </div>

        {/* Lang toggle */}
        <div style={{
          display: "flex", background: DS.accent12,
          border: `1px solid ${DS.accent24}`, borderRadius: DS.radMd,
          padding: 3, gap: 2, flexShrink: 0,
        }}>
          {[["en","EN"],["es","ES"]].map(([l, flag, label]) => (
            <button key={l} className="lang-btn" onClick={() => setLang(l)} style={{
              background: lang === l ? DS.accent : "transparent",
              color: lang === l ? DS.black : DS.textOnDarkMuted,
              border: "none", borderRadius: DS.radSm,
              padding: "4px 12px", fontSize: 11, fontWeight: 700,
              cursor: "pointer", fontFamily: DS.fontUI,
              transition: "all .15s", display: "flex", alignItems: "center", gap: 5,
              letterSpacing: "0.04em",
            }}>
              <span style={{ fontSize: 13 }}>{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* INPUT */}
        <LightCard style={{ padding: "24px 24px 20px", marginBottom: 20 }}>
          <label style={{
            display: "block", fontSize: 11, fontWeight: 700,
            color: DS.textSecondary, marginBottom: 10,
            letterSpacing: "0.06em", textTransform: "uppercase",
            fontFamily: DS.fontUI,
          }}>{t.inputLabel}</label>
          <div className="input-row">
            <input
              className="url-input"
              type="url" placeholder={t.placeholder} value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && status !== "loading" && runAudit()}
              autoComplete="off" spellCheck={false}
              style={{
                flex: 1, padding: "12px 16px",
                border: `1.5px solid ${DS.stroke}`, borderRadius: DS.radMd,
                fontSize: 14, color: DS.textPrimary, background: DS.bg,
                fontFamily: DS.fontBody, transition: "border-color .15s, box-shadow .15s",
                minWidth: 0,
              }}
            />
            <button className="run-btn" onClick={runAudit} disabled={status === "loading"} style={{
              padding: "12px 24px", background: DS.accent, color: DS.black,
              border: "none", borderRadius: DS.radSm,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: DS.fontUI, transition: "all .2s",
              whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "-0.01em",
            }}>
              {status === "loading" ? t.btnRunning : t.btnRun}
            </button>
          </div>
          {status === "error" && (
            <div style={{
              marginTop: 12, padding: "10px 14px",
              background: "#FFE8EC", border: `1px solid #FFB3BF`,
              borderRadius: DS.radMd, fontSize: 13, color: DS.red,
              wordBreak: "break-word", fontFamily: DS.fontUI,
            }}>{error}</div>
          )}
        </LightCard>

        {/* LOADING */}
        {status === "loading" && (
          <LightCard style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{
              width: 36, height: 36,
              border: `3px solid ${DS.stroke}`, borderTopColor: DS.accent,
              borderRadius: "50%", animation: "spin .7s linear infinite",
              margin: "0 auto 20px",
            }}/>
            <div style={{ fontSize: 18, fontWeight: 600, fontStyle: "italic", color: DS.textPrimary, marginBottom: 20, fontFamily: DS.fontHeading }}>{t.loading}</div>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
              {t.steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0, transition: "all .3s",
                    border: `2px solid ${i < step ? DS.accent : i === step ? DS.black : DS.stroke}`,
                    background: i < step ? DS.accent : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {i < step && <Check size={11} weight="bold" color={DS.black} />}
                    {i === step && <div style={{ width: 6, height: 6, borderRadius: "50%", background: DS.black }}/>}
                  </div>
                  <span style={{
                    color: i < step ? DS.textPrimary : i === step ? DS.textPrimary : DS.text,
                    fontWeight: i === step ? 600 : 400, fontFamily: DS.fontUI,
                  }}>{s}</span>
                </div>
              ))}
            </div>
          </LightCard>
        )}

        {/* EMPTY */}
        {status === "idle" && (
          <LightCard style={{ padding: "64px 24px", textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, background: DS.accent24, borderRadius: DS.radLg,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              border: `1px solid ${DS.accent24}`,
            }}>
              <GlobeSimple size={24} weight="duotone" color={DS.black} />
            </div>
            <div style={{
              fontSize: 24, fontWeight: 400, fontStyle: "italic", color: DS.textPrimary,
              marginBottom: 10, fontFamily: DS.fontHeading, letterSpacing: "-0.02em",
            }}>{t.emptyTitle}</div>
            <div style={{ fontSize: 14, color: DS.text, maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>{t.emptyDesc}</div>
          </LightCard>
        )}

        {/* RESULTS */}
        {status === "done" && data && (
          <div className="fade-up">

            {/* SCORE HEADER — dark card */}
            <DarkCard style={{ padding: "22px 24px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: DS.textOnDarkMuted,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    marginBottom: 6, fontFamily: DS.fontUI,
                  }}>{t.auditDone}</div>
                  <div style={{
                    fontSize: 22, fontWeight: 600, fontStyle: "italic", color: DS.textOnDark,
                    wordBreak: "break-all", marginBottom: 4,
                    fontFamily: DS.fontHeading, letterSpacing: "-0.02em",
                  }}>{hostname}</div>
                  <div style={{ fontSize: 12, color: DS.textOnDarkMuted, fontFamily: DS.fontUI }}>
                    {t.platform}: <span style={{ color: DS.textOnDark, fontWeight: 500 }}>{data.platform || "Unknown"}</span>
                  </div>
                </div>
                {/* Score badge */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: "rgba(255,255,255,0.08)", border: `1px solid ${DS.accent35}`,
                  borderRadius: DS.radXl, padding: "14px 22px", flexShrink: 0,
                }}>
                  <div>
                    <div style={{
                      fontSize: 44, fontWeight: 800, lineHeight: 1,
                      color: sc, fontFamily: DS.fontUI, letterSpacing: "-0.03em",
                    }}>{data.overall_score ?? "–"}</div>
                    <div style={{ fontSize: 11, color: DS.textOnDarkMuted, marginTop: 2, fontFamily: DS.fontUI }}>{t.outOf}</div>
                  </div>
                  <div style={{ width: 1, height: 40, background: DS.accent20 }}/>
                  <div style={{ fontSize: 11, fontWeight: 700, color: DS.textOnDark, maxWidth: 52, lineHeight: 1.3, fontFamily: DS.fontUI }}>{t.score}</div>
                </div>
              </div>
            </DarkCard>

            {/* METRICS */}
            <div className="grid-6">
              {(data.metrics || []).map((m, i) => (
                <LightCard key={i} style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: DS.text, marginBottom: 6, fontWeight: 500, fontFamily: DS.fontUI }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary, marginBottom: 8, lineHeight: 1.2, fontFamily: DS.fontUI }}>{m.value}</div>
                  <Chip value={m.status} type="status"/>
                </LightCard>
              ))}
            </div>

            {/* SEO ISSUES + DESIGN — light + light */}
            <div className="grid-2">
              <LightCard>
                <SecHead light>{t.secSEO}</SecHead>
                {(data.seo_issues || []).map((iss, i, arr) => (
                  <div key={i} style={{
                    padding: "12px 20px", display: "flex", gap: 10, alignItems: "flex-start",
                    borderBottom: i < arr.length - 1 ? `1px solid ${DS.stroke}` : "none",
                  }}>
                    <Chip value={iss.priority} type="priority"/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: DS.textPrimary, marginBottom: 2, fontFamily: DS.fontUI }}>{iss.title}</div>
                      <div style={{ fontSize: 12, color: DS.text, lineHeight: 1.5 }}>{iss.description}</div>
                    </div>
                  </div>
                ))}
              </LightCard>

              <LightCard>
                <SecHead light>{t.secDesign}</SecHead>
                {(data.design_improvements || []).map((d2, i, arr) => (
                  <div key={i} style={{
                    padding: "12px 20px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${DS.stroke}` : "none",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: DS.textPrimary, marginBottom: 3, fontFamily: DS.fontUI }}>{d2.title}</div>
                    <div style={{ fontSize: 12, color: DS.text, lineHeight: 1.5, marginBottom: d2.impact ? 6 : 0 }}>{d2.description}</div>
                    {d2.impact && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: "#2D7A1F",
                        background: DS.lightGreen, border: "1px solid #B8E8A0",
                        padding: "1px 8px", borderRadius: DS.radPill, fontFamily: DS.fontUI,
                      }}>↑ {d2.impact}</span>
                    )}
                  </div>
                ))}
              </LightCard>
            </div>

            {/* CONVERSION FOCUS — dark card */}
            <DarkCard style={{ marginBottom: 16 }}>
              <div style={{
                padding: "16px 22px", borderBottom: `1px solid ${DS.accent10}`,
                display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <span style={{
                  background: DS.accent, color: DS.black,
                  borderRadius: DS.radPill, padding: "3px 12px",
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
                  textTransform: "uppercase", fontFamily: DS.fontUI, whiteSpace: "nowrap",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}><Lightning size={13} weight="fill" /> {t.convBadge}</span>
                <span style={{ fontSize: 16, fontWeight: 600, fontStyle: "italic", color: DS.textOnDark, fontFamily: DS.fontHeading, letterSpacing: "-0.01em" }}>{t.convTitle}</span>
              </div>
              <div className="grid-conv">
                {(data.conversion_opportunities || []).map((c, i) => (
                  <div key={i} style={{
                    padding: "18px 22px",
                    borderRight: i % 2 === 0 ? `1px solid ${DS.accent10}` : "none",
                    borderBottom: i < 2 ? `1px solid ${DS.accent10}` : "none",
                  }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: DS.radSm,
                        background: DS.accent, color: DS.black,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1,
                        fontFamily: DS.fontUI,
                      }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: DS.textOnDark, marginBottom: 3, fontFamily: DS.fontUI }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: DS.textOnDarkMuted, lineHeight: 1.5 }}>{c.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DarkCard>

            {/* STRUCTURE + QUICK WINS */}
            <div className="grid-2">
              <LightCard>
                <SecHead light>{t.secStruct}</SecHead>
                {(data.structure_issues || []).map((st, i, arr) => (
                  <div key={i} style={{
                    padding: "12px 20px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${DS.stroke}` : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <MonoTag>{st.tag}</MonoTag>
                      <span style={{ fontSize: 13, fontWeight: 500, color: DS.textPrimary, flex: 1, minWidth: 100, fontFamily: DS.fontUI }}>{st.text}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#2D7A1F", fontWeight: 600, fontFamily: DS.fontUI, display: "flex", alignItems: "center", gap: 4 }}>
                      <ArrowRight size={13} weight="bold" /> {st.fix}
                    </div>
                  </div>
                ))}
              </LightCard>

              <LightCard>
                <SecHead light>{t.secWins}</SecHead>
                {(data.quick_wins || []).map((w, i, arr) => (
                  <div key={i} className="win-row" onClick={() => toggleCheck(i)} style={{
                    padding: "12px 20px", cursor: "pointer", transition: "background .12s",
                    borderBottom: i < arr.length - 1 ? `1px solid ${DS.stroke}` : "none",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: DS.radSm, marginTop: 2,
                      border: `2px solid ${checks[i] ? DS.accent : DS.stroke}`,
                      background: checks[i] ? DS.accent : DS.white,
                      flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .15s",
                    }}>
                      {checks[i] && <Check size={11} weight="bold" color={DS.black} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500, fontFamily: DS.fontUI,
                        color: checks[i] ? DS.text : DS.textPrimary,
                        textDecoration: checks[i] ? "line-through" : "none",
                      }}>{w.title}</div>
                      <div style={{ fontSize: 11, color: DS.text, marginTop: 2 }}>{w.sub}</div>
                    </div>
                  </div>
                ))}
              </LightCard>
            </div>

            {/* FOOTER */}
            <div style={{
              textAlign: "center", fontSize: 12, color: DS.text,
              marginTop: 32, paddingTop: 20, borderTop: `1px solid ${DS.stroke}`,
              fontFamily: DS.fontUI,
            }}>
              {t.footer} · {hostname}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
