import { useState } from "react";

const D = {
  pageBg:"#F5F6FA", white:"#FFFFFF",
  border:"#E5E7EB", borderMd:"#D1D5DB",
  text:"#111827", textSub:"#6B7280", textMuted:"#9CA3AF",
  brand:"#5153F6", brandDark:"#3F41D4", brandBg:"#EEF2FF", brandText:"#4338CA",
  green:"#059669", greenBg:"#ECFDF5", greenBd:"#A7F3D0",
  red:"#DC2626",   redBg:"#FEF2F2",   redBd:"#FECACA",
  yellow:"#D97706",yellowBg:"#FFFBEB", yellowBd:"#FDE68A",
  orange:"#EA580C",orangeBg:"#FFF7ED", orangeBd:"#FED7AA",
  blue:"#2563EB",  blueBg:"#EFF6FF",  blueBd:"#BFDBFE",
  radSm:6, radMd:8, radLg:12,
};

const T = {
  en:{
    headerTitle:"SEO Audit",
    headerSub:"AI-powered analysis · Claude",
    inputLabel:"Website URL",
    placeholder:"https://www.yourwebsite.com",
    btnRun:"Run Audit", btnRunning:"Analyzing…",
    steps:["Analyzing domain & platform","Auditing SEO signals","Reviewing design & structure","Identifying conversion gaps","Compiling recommendations"],
    loading:"Running audit…",
    emptyTitle:"Enter a URL to get started",
    emptyDesc:"Claude will analyze your site like a senior SEO specialist and return a structured report with prioritized recommendations.",
    platform:"Platform", auditDone:"Audit complete", score:"SEO Score", outOf:"/ 100",
    secSEO:"SEO Issues & Opportunities", secDesign:"Design Improvements",
    convBadge:"Conversion Focus", convTitle:"Revenue-Driving Improvement Opportunities",
    secStruct:"Page Structure", secWins:"Quick Wins",
    footer:"Powered by Claude AI",
    promptLang:"English",
  },
  es:{
    headerTitle:"Auditoría SEO",
    headerSub:"Análisis con IA · Claude",
    inputLabel:"URL del sitio web",
    placeholder:"https://www.tusitio.com",
    btnRun:"Ejecutar Auditoría", btnRunning:"Analizando…",
    steps:["Analizando dominio y plataforma","Auditando señales SEO","Revisando diseño y estructura","Identificando brechas de conversión","Compilando recomendaciones"],
    loading:"Ejecutando auditoría…",
    emptyTitle:"Ingresa una URL para comenzar",
    emptyDesc:"Claude analizará tu sitio como un especialista SEO senior y entregará un reporte estructurado con recomendaciones priorizadas.",
    platform:"Plataforma", auditDone:"Auditoría completa", score:"Puntuación SEO", outOf:"/ 100",
    secSEO:"Problemas y Oportunidades SEO", secDesign:"Mejoras de Diseño",
    convBadge:"Enfoque en Conversión", convTitle:"Oportunidades que Generan Ingresos",
    secStruct:"Estructura de Página", secWins:"Victorias Rápidas",
    footer:"Desarrollado con Claude AI",
    promptLang:"Spanish",
  },
};

const PROMPT = (url, lang) =>
`Audit this website as a senior SEO and conversion specialist: ${url}

Respond with ONLY a JSON object. No markdown, no fences, no text before or after. Just valid JSON.
All user-facing text fields must be in ${lang}.

Required structure (fill in real values, keep keys in English):
{
  "platform": "detected CMS in English",
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

Rules: overall_score integer 0-100. score_color: green(80+)/yellow(50-79)/red(<50).
Be SPECIFIC to ${url} — mention the actual domain and industry. Descriptions max 20 words each.
Return ONLY the JSON object.`;

// ─── helpers ─────────────────────────────────────────────────────────────────
const statusMeta = {
  good:[D.green,D.greenBg,D.greenBd],
  warn:[D.yellow,D.yellowBg,D.yellowBd],
  bad:[D.red,D.redBg,D.redBd],
  info:[D.blue,D.blueBg,D.blueBd],
};
const priMeta = {
  critical:[D.red,D.redBg,D.redBd],
  high:[D.orange,D.orangeBg,D.orangeBd],
  medium:[D.yellow,D.yellowBg,D.yellowBd],
  low:[D.blue,D.blueBg,D.blueBd],
};

function Chip({ type="status", value }) {
  const map = type === "priority" ? priMeta : statusMeta;
  const [color,bg,bd] = map[(value||"info").toLowerCase()] || map.info;
  return (
    <span style={{background:bg,color,border:`1px solid ${bd}`,fontSize:11,fontWeight:600,
      padding:"2px 9px",borderRadius:20,whiteSpace:"nowrap",textTransform:"capitalize"}}>
      {value}
    </span>
  );
}

function scoreColor(score, override) {
  if (override === "green"  || score >= 80) return D.green;
  if (override === "yellow" || score >= 50) return D.yellow;
  return D.red;
}

const Card = ({ children, style={} }) => (
  <div style={{background:D.white,border:`1px solid ${D.border}`,borderRadius:D.radLg,...style}}>
    {children}
  </div>
);

const SecHead = ({ children, dot }) => (
  <div style={{padding:"14px 18px",borderBottom:`1px solid ${D.border}`,display:"flex",alignItems:"center",gap:8}}>
    {dot && <span style={{width:6,height:6,borderRadius:"50%",background:dot,flexShrink:0,display:"inline-block"}}/>}
    <span style={{fontSize:13,fontWeight:600,color:D.text}}>{children}</span>
  </div>
);

const MonoTag = ({ children }) => (
  <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,
    background:D.brandBg,color:D.brandText,fontFamily:"monospace"}}>
    {children}
  </span>
);

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,setLang]     = useState("en");
  const [url,setUrl]       = useState("");
  const [status,setStatus] = useState("idle");
  const [data,setData]     = useState(null);
  const [error,setError]   = useState("");
  const [step,setStep]     = useState(0);
  const [checks,setChecks] = useState({});

  const t = T[lang];

  async function runAudit() {
    let clean = url.trim();
    if (!clean) return;
    if (!clean.startsWith("http")) clean = "https://" + clean;

    setStatus("loading"); setError(""); setData(null); setStep(0); setChecks({});
    const ticker = setInterval(() => setStep(i => Math.min(i + 1, t.steps.length - 1)), 1800);

    try {
      // Calls our serverless function in /api/audit.js
      // which securely forwards to Anthropic using ANTHROPIC_API_KEY env var
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: PROMPT(clean, t.promptLang)
        })
      });
      
      clearInterval(ticker);
      
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || `HTTP ${res.status}`);
      }
      
      const json = await res.json();
      const raw = json.text || "";
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
      const si = cleaned.indexOf("{");
      const ei = cleaned.lastIndexOf("}");
      let parsed = null;
      if (si !== -1 && ei !== -1) {
        try { parsed = JSON.parse(cleaned.slice(si, ei + 1)); } catch (_) {}
      }
      if (!parsed) throw new Error(`Parse failed. Response: ${raw.slice(0, 150) || "(empty)"}`);
      
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
  const sc = data ? scoreColor(data.overall_score, data.score_color) : D.brand;

  return (
    <div style={{background:D.pageBg,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:D.text,lineHeight:1.5}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn .25s ease; }
        input:focus { outline: none; border-color: ${D.brand} !important; box-shadow: 0 0 0 3px rgba(81,83,246,.12) !important; }
        .run-btn:hover:not(:disabled) { background: ${D.brandDark} !important; }
        .run-btn:disabled { opacity: .5; cursor: not-allowed; }
        .win-row:hover { background: #F9FAFB !important; }
        .grid-6  { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; margin-bottom:14px; }
        .grid-2  { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
        .grid-conv { display:grid; grid-template-columns:1fr 1fr; }
        .input-row { display:flex; gap:10px; }
        @media (max-width: 720px) {
          .grid-6   { grid-template-columns: repeat(3,1fr) !important; }
          .grid-2   { grid-template-columns: 1fr !important; }
          .grid-conv { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 420px) {
          .grid-6    { grid-template-columns: repeat(2,1fr) !important; }
          .input-row { flex-direction: column !important; }
        }
      `}</style>

      {/* ── TOPBAR ── */}
      <div style={{background:D.white,borderBottom:`1px solid ${D.border}`,padding:"0 20px",
        height:54,display:"flex",alignItems:"center",justifyContent:"space-between",
        position:"sticky",top:0,zIndex:10,gap:12}}>

        <div style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}>
          <div style={{width:30,height:30,background:D.brand,borderRadius:8,display:"flex",
            alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>🔍</div>
          <div style={{minWidth:0}}>
            <div style={{fontSize:14,fontWeight:700,color:D.text,whiteSpace:"nowrap"}}>{t.headerTitle}</div>
            <div style={{fontSize:11,color:D.textMuted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.headerSub}</div>
          </div>
        </div>

        {/* Language toggle */}
        <div style={{display:"flex",background:"#F3F4F6",border:`1px solid ${D.border}`,
          borderRadius:D.radMd,padding:3,gap:2,flexShrink:0}}>
          {[["en","🇺🇸","EN"],["es","🇪🇸","ES"]].map(([l,flag,label]) => (
            <button key={l} onClick={() => setLang(l)} style={{
              background: lang===l ? D.white : "transparent",
              color: lang===l ? D.text : D.textSub,
              border: lang===l ? `1px solid ${D.border}` : "1px solid transparent",
              borderRadius: D.radSm, padding:"4px 10px", fontSize:12, fontWeight:600,
              cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
              boxShadow: lang===l ? "0 1px 2px rgba(0,0,0,.07)" : "none",
              display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap",
            }}>
              <span style={{fontSize:14}}>{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── PAGE BODY ── */}
      <div style={{maxWidth:1080,margin:"0 auto",padding:"24px 16px 80px"}}>

        {/* INPUT */}
        <Card style={{padding:"18px 20px",marginBottom:20}}>
          <label style={{display:"block",fontSize:12,fontWeight:600,color:D.textSub,marginBottom:8,letterSpacing:".02em"}}>
            {t.inputLabel}
          </label>
          <div className="input-row">
            <input
              type="url" placeholder={t.placeholder} value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && status !== "loading" && runAudit()}
              autoComplete="off" spellCheck={false}
              style={{flex:1,padding:"10px 14px",border:`1px solid ${D.borderMd}`,borderRadius:D.radMd,
                fontSize:14,color:D.text,background:D.white,fontFamily:"inherit",
                transition:"border-color .15s,box-shadow .15s",minWidth:0}}
            />
            <button className="run-btn" onClick={runAudit} disabled={status==="loading"} style={{
              padding:"10px 20px",background:D.brand,color:"#fff",border:"none",
              borderRadius:D.radMd,fontSize:14,fontWeight:600,cursor:"pointer",
              fontFamily:"inherit",transition:"background .15s",whiteSpace:"nowrap",flexShrink:0,
            }}>
              {status === "loading" ? t.btnRunning : t.btnRun}
            </button>
          </div>
          {status === "error" && (
            <div style={{marginTop:12,padding:"10px 14px",background:D.redBg,border:`1px solid ${D.redBd}`,
              borderRadius:D.radMd,fontSize:13,color:D.red,wordBreak:"break-word"}}>
              {error}
            </div>
          )}
        </Card>

        {/* LOADING */}
        {status === "loading" && (
          <Card style={{padding:"44px 24px",textAlign:"center"}}>
            <div style={{width:34,height:34,border:`3px solid ${D.border}`,borderTopColor:D.brand,
              borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 18px"}}/>
            <div style={{fontSize:14,fontWeight:600,color:D.text,marginBottom:18}}>{t.loading}</div>
            <div style={{display:"inline-flex",flexDirection:"column",alignItems:"flex-start",gap:8}}>
              {t.steps.map((s,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}>
                  <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,transition:"all .3s",
                    border:`2px solid ${i<step?D.green:i===step?D.brand:D.border}`,
                    background:i<step?D.green:"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {i < step  && <span style={{color:"#fff",fontSize:9,fontWeight:700}}>✓</span>}
                    {i === step && <div style={{width:6,height:6,borderRadius:"50%",background:D.brand}}/>}
                  </div>
                  <span style={{color:i<step?D.green:i===step?D.text:D.textMuted,fontWeight:i===step?600:400}}>{s}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* EMPTY */}
        {status === "idle" && (
          <Card style={{padding:"56px 24px",textAlign:"center"}}>
            <div style={{width:48,height:48,background:D.brandBg,borderRadius:14,display:"flex",
              alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 14px"}}>🌐</div>
            <div style={{fontSize:16,fontWeight:600,color:D.text,marginBottom:8}}>{t.emptyTitle}</div>
            <div style={{fontSize:14,color:D.textSub,maxWidth:400,margin:"0 auto"}}>{t.emptyDesc}</div>
          </Card>
        )}

        {/* RESULTS */}
        {status === "done" && data && (
          <div className="fade-in">

            {/* SCORE HEADER */}
            <Card style={{padding:"18px 20px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{fontSize:11,fontWeight:600,color:D.textMuted,textTransform:"uppercase",
                    letterSpacing:".06em",marginBottom:4}}>{t.auditDone}</div>
                  <div style={{fontSize:16,fontWeight:700,color:D.text,wordBreak:"break-all",marginBottom:3}}>{hostname}</div>
                  <div style={{fontSize:12,color:D.textSub}}>
                    {t.platform}: <span style={{color:D.text,fontWeight:500}}>{data.platform || "Unknown"}</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12,background:D.pageBg,
                  border:`1px solid ${D.border}`,borderRadius:D.radLg,padding:"12px 20px",flexShrink:0}}>
                  <div>
                    <div style={{fontSize:38,fontWeight:700,lineHeight:1,color:sc}}>{data.overall_score ?? "-"}</div>
                    <div style={{fontSize:11,color:D.textMuted,marginTop:2}}>{t.outOf}</div>
                  </div>
                  <div style={{width:1,height:38,background:D.border}}/>
                  <div style={{fontSize:12,fontWeight:600,color:D.textSub,maxWidth:60,lineHeight:1.3}}>{t.score}</div>
                </div>
              </div>
            </Card>

            {/* METRICS */}
            <div className="grid-6">
              {(data.metrics || []).map((m,i) => (
                <Card key={i} style={{padding:"13px 14px"}}>
                  <div style={{fontSize:11,color:D.textMuted,marginBottom:5,fontWeight:500}}>{m.label}</div>
                  <div style={{fontSize:13,fontWeight:700,color:D.text,marginBottom:7,lineHeight:1.2}}>{m.value}</div>
                  <Chip value={m.status} type="status"/>
                </Card>
              ))}
            </div>

            {/* SEO ISSUES + DESIGN */}
            <div className="grid-2">
              <Card>
                <SecHead dot={D.brand}>{t.secSEO}</SecHead>
                {(data.seo_issues || []).map((iss,i,arr) => (
                  <div key={i} style={{padding:"12px 18px",display:"flex",gap:10,alignItems:"flex-start",
                    borderBottom:i<arr.length-1?`1px solid ${D.border}`:"none"}}>
                    <Chip value={iss.priority} type="priority"/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:D.text,marginBottom:2}}>{iss.title}</div>
                      <div style={{fontSize:12,color:D.textSub,lineHeight:1.5}}>{iss.description}</div>
                    </div>
                  </div>
                ))}
              </Card>

              <Card>
                <SecHead dot={D.green}>{t.secDesign}</SecHead>
                {(data.design_improvements || []).map((d2,i,arr) => (
                  <div key={i} style={{padding:"12px 18px",
                    borderBottom:i<arr.length-1?`1px solid ${D.border}`:"none"}}>
                    <div style={{fontSize:13,fontWeight:600,color:D.text,marginBottom:3}}>{d2.title}</div>
                    <div style={{fontSize:12,color:D.textSub,lineHeight:1.5,marginBottom:d2.impact?6:0}}>{d2.description}</div>
                    {d2.impact && (
                      <span style={{fontSize:11,fontWeight:600,color:D.green,background:D.greenBg,
                        border:`1px solid ${D.greenBd}`,padding:"1px 8px",borderRadius:20}}>
                        ↑ {d2.impact}
                      </span>
                    )}
                  </div>
                ))}
              </Card>
            </div>

            {/* CONVERSION FOCUS */}
            <Card style={{marginBottom:14,border:`1.5px solid ${D.brand}33`}}>
              <div style={{padding:"14px 20px",borderBottom:`1px solid ${D.border}`,
                display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <span style={{background:D.brandBg,border:`1px solid ${D.brand}44`,borderRadius:D.radSm,
                  padding:"3px 10px",fontSize:11,fontWeight:700,color:D.brandText,
                  letterSpacing:".04em",textTransform:"uppercase",whiteSpace:"nowrap"}}>
                  ⚡ {t.convBadge}
                </span>
                <span style={{fontSize:14,fontWeight:600,color:D.text}}>{t.convTitle}</span>
              </div>
              <div className="grid-conv">
                {(data.conversion_opportunities || []).map((c,i) => (
                  <div key={i} style={{padding:"16px 20px",
                    borderRight:i%2===0?`1px solid ${D.border}`:"none",
                    borderBottom:i<2?`1px solid ${D.border}`:"none"}}>
                    <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{width:22,height:22,borderRadius:6,background:D.brand,color:"#fff",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:11,fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:D.text,marginBottom:3}}>{c.title}</div>
                        <div style={{fontSize:12,color:D.textSub,lineHeight:1.5}}>{c.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* STRUCTURE + QUICK WINS */}
            <div className="grid-2">
              <Card>
                <SecHead dot={D.blue}>{t.secStruct}</SecHead>
                {(data.structure_issues || []).map((st,i,arr) => (
                  <div key={i} style={{padding:"11px 18px",
                    borderBottom:i<arr.length-1?`1px solid ${D.border}`:"none"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                      <MonoTag>{st.tag}</MonoTag>
                      <span style={{fontSize:13,fontWeight:500,color:D.text,flex:1,minWidth:120}}>{st.text}</span>
                    </div>
                    <div style={{fontSize:12,color:D.brand,fontWeight:500}}>→ {st.fix}</div>
                  </div>
                ))}
              </Card>

              <Card>
                <SecHead dot={D.yellow}>{t.secWins}</SecHead>
                {(data.quick_wins || []).map((w,i,arr) => (
                  <div key={i} className="win-row" onClick={() => toggleCheck(i)} style={{
                    padding:"11px 18px",cursor:"pointer",transition:"background .12s",
                    borderBottom:i<arr.length-1?`1px solid ${D.border}`:"none",
                    display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{width:17,height:17,borderRadius:4,marginTop:2,transition:"all .15s",
                      border:`2px solid ${checks[i]?D.green:D.borderMd}`,
                      background:checks[i]?D.green:D.white,flexShrink:0,
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {checks[i] && <span style={{color:"#fff",fontSize:9,fontWeight:700}}>✓</span>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:500,
                        color:checks[i]?D.textMuted:D.text,
                        textDecoration:checks[i]?"line-through":"none"}}>{w.title}</div>
                      <div style={{fontSize:11,color:D.textMuted,marginTop:2}}>{w.sub}</div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>

            <div style={{textAlign:"center",fontSize:12,color:D.textMuted,
              marginTop:28,paddingTop:18,borderTop:`1px solid ${D.border}`}}>
              {t.footer} · {hostname}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
