"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import ContactCard from "./ContactCard";
import CommentsSection from "./CommentsSection";
import { MarketPulse } from "./MarketPulse";
import { detectProductCategory } from "@/lib/product-categories";

// ── Types ──────────────────────────────────────────────────────────────
interface GTMBrief {
  empresa: string;
  producto: string;
  pais: string;
  vertical: string;
  buyer: string;
  tier: "Tier1" | "Tier2" | "Tier3";
  url_competidor: string;
  url_cliente_ideal: string;
}

interface NervResult {
  empresa: string;
  tier: string;
  icp_score: number;
  latido_mercado: string;
  diagnostico: {
    friccion_operativa: string;
    dolor_critico: string;
    resolucion_tactica: string;
  };
  plan_ataque: {
    schwerpunkt: string;
    flanqueo: string;
    apertura: string;
  };
  auditoria: {
    abogado_diablo: string;
    sesgo: string;
    confianza: string;
  };
  similares: string[];
  competidores: { name: string; url: string | null }[];
  clientes_potenciales?: { name: string; url: string | null }[];
  evidencia?: string[];
  markdown: string;
  discovery_mode?: boolean;
  logId?: number;
  empresaId?: number;
  analisis_forense?: {
    inferencia_raise: string;
    friccion_tecnica: string;
    dolor_financiero: string;
  };
}

// ── Constants ──────────────────────────────────────────────────────────
const HUBS = [
  { id: "latam", name: "Latam Hub", icon: "🌎" },
  { id: "europe", name: "Europe Hub", icon: "🇪🇺" },
];

const PAISES_LATAM = [
  "México", "Colombia", "Brasil", "Chile",
  "Argentina", "Perú", "Toda Latam",
];

const PAISES_EUROPA = [
  "UK", "Germany", "Sweden", "Netherlands",
  "France", "Spain", "Toda Europa",
];

const VERTICALES = [
  "Payments & Remittances", "Lending", "Digital Banking",
  "Tech Infrastructure", "Open Finance", "Insurtech",
  "Enterprise Financial Mgmt", "Crypto & Blockchain",
  "Wealth Management", "Proptech", "Crowdfunding",
  "Personal Financial Management",
];

const TIERS = [
  {
    id: "Tier1",
    nombre: "Tier 1 — Estratégico",
    desc: "MEDDICII · Schwerpunkt · Sandler",
    color: "#1a1a2e",
  },
  {
    id: "Tier2",
    nombre: "Tier 2 — Técnico",
    desc: "Flanqueo · SPIN selling",
    color: "#16213e",
  },
  {
    id: "Tier3",
    nombre: "Tier 3 — Volumen",
    desc: "Predictable Revenue · BANT",
    color: "#0f3460",
  },
] as const;

// ── Supabase Client (Imported from @/lib/supabase) ──────────────────────

// ── Feedback Widget Component ──────────────────────────────────────────
function FeedbackWidget({ logId, empresa }: { logId: number; empresa: string }) {
  const [voted, setVoted] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleVote = async (isRelevant: boolean) => {
    setVoted(isRelevant);
    try {
      await supabase
        .from("logs_busquedas")
        .update({ es_relevante: isRelevant })
        .eq("id", logId);
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleSubmitComment = async () => {
    try {
      await supabase
        .from("logs_busquedas")
        .update({ feedback_texto: comment })
        .eq("id", logId);
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  return (
    <div style={styles.feedbackWrap}>
      <h4 style={styles.feedbackTitle}>¿Es este plan relevante para {empresa}?</h4>
      <p style={styles.feedbackSubtitle}>Ayúdanos a calibrar la inteligencia de NERV.</p>
      
      {!submitted ? (
        <>
          <div style={styles.feedbackBtnWrap}>
            <button 
              style={{...styles.feedbackBtn, ...(voted === true ? styles.feedbackBtnActive : {})}}
              onClick={() => handleVote(true)}
            >
              🚀 Sí, es preciso
            </button>
            <button 
              style={{...styles.feedbackBtn, ...(voted === false ? styles.feedbackBtnActive : {})}}
              onClick={() => handleVote(false)}
            >
              🤔 Podría mejorar
            </button>
          </div>
          
          {voted !== null && (
            <div style={styles.feedbackInputWrap}>
              <textarea 
                style={styles.textarea}
                placeholder="¿Algún detalle adicional?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button 
                style={{...styles.btnPrimary, marginTop: 12}} 
                onClick={handleSubmitComment}
              >
                Enviar validación
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={styles.feedbackThanks}>
          ✨ ¡Gracias! Tu feedback ha sido registrado para mejorar el modelo.
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function NervForm({ userEmail }: { userEmail?: string } = {}) {
  const [activeHub, setActiveHub] = useState<"latam" | "europe">("latam");
  const [brief, setBrief] = useState<GTMBrief>({
    empresa: "",
    producto: "",
    pais: "",
    vertical: "",
    buyer: "",
    tier: "Tier1",
    url_competidor: "",
    url_cliente_ideal: "",
  });

  const [loading, setLoading] = useState(false);
  const [smartPrompt, setSmartPrompt] = useState("");
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<NervResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [isForensic, setIsForensic] = useState(true);

  // ── Discovery Mode ─────────────────────────────────────────────────────
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [discoverySearching, setDiscoverySearching] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<any[] | null>(null);
  const [discoveryMeta, setDiscoveryMeta] = useState<{ pais: string | null; vertical: string | null; total: number } | null>(null);

  const handleSemanticDiscovery = async () => {
    if (!discoveryQuery.trim()) return;
    setDiscoverySearching(true);
    setDiscoveryResults(null);
    setDiscoveryMeta(null);
    try {
      const res = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: discoveryQuery }),
      });
      if (!res.ok) throw new Error("Error en Discovery");
      const data = await res.json();
      setDiscoveryResults(data.empresas || []);
      setDiscoveryMeta({ pais: data.filtros_detectados?.pais, vertical: data.filtros_detectados?.vertical, total: data.total });
    } catch (e) {
      console.error("Discovery error:", e);
    } finally {
      setDiscoverySearching(false);
    }
  };
  const [nexusResponse, setNexusResponse] = useState<{
    msg: string | null;
    type: "guide" | "error" | "success" | null;
  }>({ msg: "¡Hola! ¿Qué empresa quieres analizar hoy? (Ej: Nuvei en Brasil)", type: "guide" });

  const LOADING_MSGS = [
    "Consultando universo Fintech Latam...",
    "Activando protocolos de Inteligencia Forense...",
    "Detectando señales reales (10-Ks, News)...",
    "Calculando Schwerpunkt estratégico...",
    "Ejecutando /rai-quality-review...",
    "Auditando sesgos de datos...",
    "Generando Dossier de Alta Fidelidad...",
  ];

  const handleSmartDiscovery = async () => {
    if (!smartPrompt.trim()) return;
    setParsing(true);
    try {
      const resp = await fetch("/api/smart-parser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: smartPrompt }),
      });
      if (resp.ok) {
        const data = await resp.json();
        
        // 1. Validar Relevancia (Lead Guard)
        if (data.es_relevante === false) {
          setNexusResponse({ 
            msg: `🛡️ Acceso Denegado: ${data.motivo_rechazo || "NERV se enfoca solo en Fintech, Payments y Retailers de alto impacto para garantizar calidad."}`, 
            type: "error" 
          });
          return;
        }

        // 2. Actualizar Brief
        setBrief((prev) => ({ ...prev, ...data }));

        // 3. Manejar Guía o Éxito
        if (data.pregunta_guia) {
          setNexusResponse({ msg: data.pregunta_guia, type: "guide" });
        } else {
          setNexusResponse({ msg: "🎯 Puntería Perfecta. He rellenado el formulario. ¿Deseas ajustar algo o generar el análisis?", type: "success" });
          setSmartPrompt(""); 
        }
      }
    } catch (err) {
      console.error("Parser error:", err);
      setNexusResponse({ msg: "Hubo un error en la conexión con el motor NERV.", type: "error" });
    } finally {
      setParsing(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setBrief((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleSubmit = async () => {
    if (!brief.empresa || !brief.producto) {
      setError("Completa empresa y producto.");
      return;
    }

    if (!brief.pais) brief.pais = "México";
    if (!brief.vertical) brief.vertical = "Payments & Remittances";

    const startTime = Date.now();
    setError(null);
    setLoading(true);
    setStep("loading");

    let msgIdx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[msgIdx]);
    }, 2000);

    try {
      let empresaData: any = null;
      let benchmarkData: any[] = [];
      let competidoresData: { name: string; url: string | null }[] = [];
      let clientesPotencialesData: any[] = [];

      // 1. Buscar empresa en Supabase (Priorizar v3)
      try {
        const { data: searchData } = await supabase
          .from("empresas_v3")
          .select("*")
          .ilike("nombre", `%${brief.empresa}%`)
          .limit(1);
        
        if (searchData && searchData.length > 0) {
          empresaData = searchData[0];
        } else {
          const { data: v2Data } = await supabase.from("empresas_v2").select("*").ilike("name", `%${brief.empresa}%`).limit(1);
          if (v2Data && v2Data.length > 0) empresaData = v2Data[0];
        }
      } catch (e) { console.warn("Fetch empresa failed", e); }

      // 2. Similares
      try {
        const { data } = await supabase.from("benchmark_raw").select("empresa_similar, segmento").ilike("empresa_origen", brief.empresa).limit(10);
        benchmarkData = data || [];
      } catch (e) { console.warn("Fetch benchmark failed", e); }

      // 3. Competidores y Leads
      try {
        const name = brief.empresa.trim();
        // Competidores
        const { data: v3C } = await supabase.from("empresas_v3").select("competitors_verified").ilike("nombre", `%${name}%`).maybeSingle();
        if (v3C?.competitors_verified?.length > 0) {
          competidoresData = v3C.competitors_verified.map((n: string) => ({ name: n, url: null }));
        } else {
          const { data: v2C } = await supabase.from("empresas_v2").select("competitors_verified").ilike("name", `%${name}%`).maybeSingle();
          if (v2C?.competitors_verified?.length > 0) {
            competidoresData = v2C.competitors_verified.map((n: string) => ({ name: n, url: null }));
          } else {
            const cat = detectProductCategory(brief.producto);
            const { data: fallbackC } = await supabase.from("empresas_v2").select("name, website").eq("vertical_finnovista", cat).neq("name", brief.empresa).limit(8);
            competidoresData = fallbackC?.map(c => ({ name: c.name, url: c.website })) || [];
          }
        }

        // Leads
        const rawV = empresaData?.vertical_finnovista || brief.vertical;
        const MAP: Record<string, string[]> = {
          "gaming": ["Payments & Remittances", "Tech Infrastructure"],
          "igaming": ["Payments & Remittances", "Tech Infrastructure"],
          "retail": ["Payments & Remittances", "Enterprise Financial Mgmt"],
          "ecommerce": ["Payments & Remittances"],
          "real estate": ["Proptech", "Lending"],
          "insurance": ["Insurtech"],
          "crypto": ["Crypto & Blockchain"],
        };
        const vL = rawV.toLowerCase();
        let ts = [rawV];
        for (const k in MAP) { if (vL.includes(k)) { ts = MAP[k]; break; } }
        
        const cMap: Record<string, string> = { "México": "Mexico", "Perú": "Peru", "Panamá": "Panama" };
        const normC = cMap[brief.pais] || brief.pais;
        let q = supabase.from("empresas_v2").select("name, website").in("vertical_finnovista", ts).order("icp_score", { ascending: false }).limit(10);
        if (normC && normC !== "Toda Latam") q = q.eq("country", normC);
        const { data: ls } = await q;
        clientesPotencialesData = ls?.map(l => ({ name: l.name, url: l.website })) || [];
      } catch (e) { console.warn("Fetch leads failed", e); }

      // 4. API Nexus
      const response = await fetch("/api/nexus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          empresa_supabase: empresaData || null,
          benchmark: benchmarkData || [],
          competidores: competidoresData || [],
          clientes_potenciales: clientesPotencialesData || [],
          isForensic,
        }),
      });

      if (!response.ok) throw new Error("Error en el análisis");
      const data: NervResult = await response.json();
      setResult({ ...data, empresaId: empresaData?.id });
      setStep("result");

      // Logging no-bloqueante — un fallo aquí nunca afecta al usuario
      fetch("/api/log-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa: brief.empresa,
          producto: brief.producto,
          pais: brief.pais,
          vertical: brief.vertical,
          tier: brief.tier,
          icp_score: data.icp_score ?? null,
          duration_ms: Date.now() - startTime,
        }),
      }).catch(() => {});
    } catch (err: any) {
      console.error("DETAILED_FRONTEND_ERROR:", err);
      setError(err.message || "Error generando la estrategia. Intenta de nuevo.");
      setStep("form");
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setResult(null);
    setError(null);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.empresa.replace(/\s+/g, "_")}_nerv.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render: Loading ──────────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingInner}>
          <div style={styles.radar}>
            <div style={styles.radarRing1} />
            <div style={styles.radarRing2} />
            <div style={styles.radarRing3} />
            <div style={styles.radarDot} />
          </div>
          <p style={styles.loadingMsg}>{loadingMsg}</p>
          <p style={styles.loadingEmoji}>🛰️</p>
        </div>
      </div>
    );
  }

  // ── Render: Result ───────────────────────────────────────────────────
  if (step === "result" && result) {
    return (
      <div style={styles.resultWrap}>
        {userEmail && (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "8px 20px 0", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>👤 {userEmail}</span>
            <button
              style={{ fontSize: 11, color: "#94a3b8", background: "transparent", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
              onClick={handleSignOut}
            >
              Salir
            </button>
          </div>
        )}
        <div style={styles.resultHeader}>
          <div>
            <h1 style={styles.resultTitle}>{result.empresa}</h1>
            <div style={styles.resultMeta}>
              <span style={styles.tierBadge}>{result.tier}</span>
              <span style={styles.scoreBadge}>
                ICP {result.icp_score}/100
              </span>
            </div>
          </div>
          <div style={styles.resultActions}>
            <button style={styles.btnDownload} onClick={handleDownload}>
              Descargar .md
            </button>
            <button style={styles.btnReset} onClick={handleReset}>
              Nueva consulta
            </button>
          </div>
        </div>

        <div style={styles.resultGrid}>
          {/* Análisis Forense RaiSE */}
          <div style={{ ...styles.card, border: "1px solid #0f172a", background: "#f8fafc" }}>
            <h3 style={{ ...styles.cardTitle, color: "#0f172a" }}>🧠 Inferencia RaiSE v2.2</h3>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Hipótesis Forense (Deducida)
              </span>
              <p style={{ fontSize: 13, color: "#1e293b", margin: "4px 0", lineHeight: 1.5, fontWeight: 500 }}>
                {result.analisis_forense?.inferencia_raise || "[INFERENCIA_EN_PROCESO]"}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "white", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Fricción Técnica</span>
                <p style={{ fontSize: 12, color: "#334155", margin: "4px 0" }}>{result.analisis_forense?.friccion_tecnica || "[SÓLO_INFERIDO]"}</p>
              </div>
              <div style={{ background: "#fffbeb", padding: 12, borderRadius: 8, border: "1px solid #fde68a" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#92400e", textTransform: "uppercase" }}>Dolor Financiero / Riesgo</span>
                <p style={{ fontSize: 12, color: "#b45309", margin: "4px 0" }}>{result.analisis_forense?.dolor_financiero || "[CALCULANDO...]"}</p>
              </div>
            </div>
          </div>

          {/* Diagnóstico Ejecutivo */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🔬 Dossier de Estrategia</h3>
            <table style={styles.diagTable}>
              <tbody>
                <tr>
                  <td style={styles.diagLabel}>⚙️ Fricción Operativa</td>
                  <td style={styles.diagValue}>{result.diagnostico?.friccion_operativa || "[PENDIENTE]"}</td>
                </tr>
                <tr>
                  <td style={styles.diagLabel}>🚨 Dolor Crítico</td>
                  <td style={styles.diagValue}>{result.diagnostico?.dolor_critico || "[PENDIENTE]"}</td>
                </tr>
                <tr>
                  <td style={styles.diagLabel}>🎯 Resolución Táctica</td>
                  <td style={styles.diagValue}>{result.diagnostico?.resolucion_tactica || "[PENDIENTE]"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Plan de Ataque */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⚔️ Plan de Ataque</h3>
            <div style={styles.atacqueItem}>
              <span style={styles.ataqueLabel}>Schwerpunkt</span>
              <p style={styles.ataqueText}>{result.plan_ataque?.schwerpunkt || "[PENDIENTE]"}</p>
            </div>
            <div style={styles.atacqueItem}>
              <span style={styles.ataqueLabel}>Flanqueo</span>
              <p style={styles.ataqueText}>{result.plan_ataque?.flanqueo || "[PENDIENTE]"}</p>
            </div>
            <div style={{ ...styles.atacqueItem, background: "#f0fdf4", borderRadius: 8, padding: "10px 12px" }}>
              <span style={styles.ataqueLabel}>Apertura recomendada</span>
              <p style={{ ...styles.ataqueText, fontStyle: "italic" }}>
                "{result.plan_ataque?.apertura || "[MENSAJE_NO_DISPONIBLE]"}"
              </p>
            </div>
          </div>

          {/* Auditoría */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🧠 Auditoría RaiSE</h3>
            <div style={styles.auditItem}>
              <span style={styles.auditLabel}>⚠️ Abogado del Diablo</span>
              <p style={styles.auditText}>{result.auditoria?.abogado_diablo || "[SIN_CRITICAS]"}</p>
            </div>
            <div style={styles.auditItem}>
              <span style={styles.auditLabel}>🔍 Sesgo detectado</span>
              <p style={styles.auditText}>{result.auditoria?.sesgo || "[SIN_SESGOS]"}</p>
            </div>
            <div style={styles.confidenceBadge}>
              Confianza general: {result.auditoria?.confianza || "BAJA"}
            </div>
            {result.evidencia && result.evidencia.length > 0 && (
              <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 8 }}>
                <span style={{ fontSize: "0.75rem", color: "#666", fontWeight: "bold" }}>🌍 EVIDENCIA VERIFICADA:</span>
                <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, fontSize: "0.75rem", color: "#444" }}>
                  {Array.isArray(result.evidencia) && result.evidencia.map((ev, i) => {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = ev.split(urlRegex);
                    return (
                      <li key={i}>
                        {parts.map((part, j) => 
                          urlRegex.test(part) ? (
                            <a key={j} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
                              {part}
                            </a>
                          ) : part
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Similares */}
          {(result.similares?.length ?? 0) > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🔗 Similares en el ecosistema</h3>
              <div style={styles.tagsWrap}>
                {Array.isArray(result.similares) && result.similares.map((s, idx) => {
                  const sName = typeof s === 'string' ? s : (s && (s as any).name) || 'Empresa Similar';
                  return (
                    <span key={`sim-${idx}-${sName}`} style={styles.tag}>
                      {sName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Competidores Reales */}
          {(result.competidores?.length ?? 0) > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>⚔️ Competidores Reales</h3>
              <div style={styles.tagsWrap}>
                {Array.isArray(result.competidores) && result.competidores.map((c: any, idx) => (
                  <span key={`real-comp-${idx}`} style={{...styles.tag, background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3"}}>
                    {c && (typeof c === 'string' ? c : c.name || 'Competidor')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Market Pulse (Latido del Mercado) */}
          {result.empresaId && (
            <MarketPulse empresaId={result.empresaId} empresaNombre={result.empresa} />
          )}

          {/* Cuentas Objetivo (Leads) */}
          {(result.clientes_potenciales?.length ?? 0) > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🎯 Cuentas Objetivo (Leads)</h3>
              <div style={styles.tagsWrap}>
                {Array.isArray(result.clientes_potenciales) && result.clientes_potenciales.map((l: any, idx) => {
                  if (!l) return null;
                  return (
                    <a 
                      key={`lead-${idx}`} 
                    href={l.url || '#'}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      ...styles.tag, 
                      background: "#f0f9ff", 
                      color: "#0369a1",
                      border: "1px solid #bae6fd",
                      textDecoration: l.url ? "underline" : "none",
                      cursor: l.url ? "pointer" : "default"
                    }}
                  >
                    {l.name}
                  </a>
                );})}
              </div>
            </div>
          )}
        </div>

        {/* Bucle de Calidad: Widget de Feedback */}
        {result.logId && (
          <FeedbackWidget logId={result.logId} empresa={result.empresa} />
        )}

        <CommentsSection />
      </div>
    );
  }

  // ── Render: Form ─────────────────────────────────────────────────────
  return (
    <div style={styles.wrap}>
      {/* Barra de usuario / sign-out */}
      {userEmail && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "8px 20px 0", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>👤 {userEmail}</span>
          <button
            style={{ fontSize: 11, color: "#94a3b8", background: "transparent", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
            onClick={handleSignOut}
          >
            Salir
          </button>
        </div>
      )}
      {/* ── DISCOVERY SEMÁNTICO ── */}
      <div style={{ margin: "16px 20px 8px", background: "linear-gradient(135deg,#0f172a,#1e1b4b)", borderRadius: 14, padding: "20px 24px", border: "1px solid rgba(99,102,241,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>🔭</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Discovery Semántico
          </span>
          <span style={{ fontSize: 11, color: "#4c1d95", background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 100, padding: "2px 10px", fontWeight: 600 }}>
            pgvector · 1,899 empresas
          </span>
        </div>
        <p style={{ fontSize: 12, color: "#6366f1", margin: "0 0 12px", lineHeight: 1.5 }}>
          Describe lo que buscas en lenguaje natural — sin escribir el nombre exacto.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={discoveryQuery}
            onChange={(e) => setDiscoveryQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSemanticDiscovery()}
            placeholder={`"quiero casinos en Brasil" · "fintechs de crédito en México" · "neobancos Colombia"`}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.4)",
              color: "#e0e7ff", fontSize: 13, outline: "none",
            }}
          />
          <button
            onClick={handleSemanticDiscovery}
            disabled={discoverySearching}
            style={{
              padding: "10px 20px", borderRadius: 8,
              background: discoverySearching ? "#312e81" : "linear-gradient(135deg,#4f46e5,#7c3aed)",
              color: "white", border: "none", fontSize: 13, fontWeight: 700,
              cursor: discoverySearching ? "not-allowed" : "pointer", whiteSpace: "nowrap",
            }}
          >
            {discoverySearching ? "Buscando..." : "Buscar →"}
          </button>
        </div>

        {/* Resultados del Discovery */}
        {discoveryMeta && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: "#818cf8", marginBottom: 8 }}>
              {discoveryMeta.total} empresa{discoveryMeta.total !== 1 ? "s" : ""} encontrada{discoveryMeta.total !== 1 ? "s" : ""}
              {discoveryMeta.pais ? ` · ${discoveryMeta.pais}` : ""}
              {discoveryMeta.vertical ? ` · ${discoveryMeta.vertical}` : ""}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(discoveryResults || []).slice(0, 15).map((emp: any, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    setBrief((prev) => ({ ...prev, empresa: emp.nombre, pais: emp.pais || prev.pais, vertical: emp.vertical || prev.vertical }));
                    setDiscoveryResults(null);
                    setDiscoveryMeta(null);
                    setDiscoveryQuery("");
                  }}
                  style={{
                    padding: "5px 12px", borderRadius: 20,
                    background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)",
                    color: "#a5b4fc", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  title={emp.descripcion || emp.vertical || ""}
                >
                  {emp.nombre}
                  {emp.icp_score ? <span style={{ color: "#6366f1", marginLeft: 4 }}>· {emp.icp_score}</span> : ""}
                </button>
              ))}
            </div>
            {(discoveryResults?.length ?? 0) === 0 && (
              <p style={{ fontSize: 12, color: "#4338ca", margin: 0 }}>
                Sin resultados — intenta con términos más generales.
              </p>
            )}
          </div>
        )}
      </div>

      {/* HUB SELECTOR */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {HUBS.map(hub => (
          <button
            key={hub.id}
            onClick={() => {
              setActiveHub(hub.id as any);
              setBrief(prev => ({ ...prev, pais: "" })); // Reset pais when switching hubs
            }}
            style={{
              flex: 1,
              padding: "16px",
              borderRadius: "16px",
              border: "2px solid",
              borderColor: activeHub === hub.id ? "#1a1a2e" : "#eee",
              background: activeHub === hub.id ? "#1a1a2e" : "white",
              color: activeHub === hub.id ? "white" : "#666",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
              transition: "all 0.2s",
              boxShadow: activeHub === hub.id ? "0 4px 15px rgba(26,26,46,0.2)" : "none"
            }}
          >
            {hub.icon} {hub.name}
          </button>
        ))}
      </div>

      <div style={styles.header}>
        <span style={styles.headerIcon}>🛰️</span>
        <div>
          <h1 style={styles.title}>NERV</h1>
          <p style={styles.subtitle}>
            El sistema nervioso del ecosistema Fintech Latam
          </p>
        </div>
        
        {/* A/B TEST TOGGLE */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: "#f1f5f9", padding: 4, borderRadius: 12 }}>
          <button 
            onClick={() => setIsForensic(false)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              background: !isForensic ? "white" : "transparent",
              color: !isForensic ? "#0f172a" : "#64748b",
              border: "none",
              cursor: "pointer",
              boxShadow: !isForensic ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.2s"
            }}
          >
            🤖 Genérica
          </button>
          <button 
            onClick={() => setIsForensic(true)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              background: isForensic ? "#0f172a" : "transparent",
              color: isForensic ? "white" : "#64748b",
              border: "none",
              cursor: "pointer",
              boxShadow: isForensic ? "0 4px 12px rgba(15,23,42,0.2)" : "none",
              transition: "all 0.2s"
            }}
          >
            🔬 Forense
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.section}>
        <div style={styles.field}>
          <label style={styles.label}>¿Con qué empresa quieres cerrar?</label>
          <input
            style={styles.input}
            name="empresa"
            value={brief.empresa}
            onChange={handleChange}
            placeholder="Ej. Nuvei, EBANX, Stripe..."
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>¿Qué vendes tú?</label>
          <textarea
            style={styles.textarea}
            name="producto"
            value={brief.producto}
            onChange={handleChange}
            placeholder="Describe tu producto o servicio principal..."
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={handleSubmit}
          disabled={loading || !brief.empresa || !brief.producto}
          style={{
            ...styles.btnPrimary,
            width: '100%',
            opacity: (loading || !brief.empresa || !brief.producto) ? 0.5 : 1,
            cursor: (loading || !brief.empresa || !brief.producto) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? "Generando Inteligencia..." : "Generar Dossier Forense"}
        </button>
      </div>

      <div style={styles.divider} />

      <div style={styles.divider} />

      <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', margin: '20px 0' }}>
        🚀 NERV consultará las 2,500+ empresas del ecosistema Fintech Latam para generar tu ficha de ataque personalizada.
      </p>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrap: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "2rem 1.5rem",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: "2rem",
  },
  headerIcon: { fontSize: 32 },
  title: {
    fontSize: 24,
    fontWeight: 600,
    margin: 0,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    margin: "2px 0 0",
  },
  section: { marginBottom: "1.5rem" },
  sectionLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: 12,
  },
  field: { marginBottom: 12 },
  label: {
    display: "block",
    fontSize: 13,
    color: "#475569",
    marginBottom: 4,
  },
  optional: {
    fontSize: 10,
    background: "#f1f5f9",
    color: "#94a3b8",
    padding: "2px 6px",
    borderRadius: 4,
    marginLeft: 6,
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    fontSize: 14,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    outline: "none",
    color: "#0f172a",
    background: "#fff",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    padding: "8px 12px",
    fontSize: 14,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    outline: "none",
    color: "#0f172a",
    background: "#fff",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    minHeight: 80,
    resize: "vertical" as const,
    lineHeight: 1.5,
  },
  select: {
    width: "100%",
    padding: "8px 12px",
    fontSize: 14,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    outline: "none",
    color: "#0f172a",
    background: "#fff",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  divider: {
    borderTop: "1px solid #f1f5f9",
    margin: "1.5rem 0",
  },
  tierGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  tierCard: {
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    cursor: "pointer",
    transition: "all 0.12s",
  },
  tierCardActive: {
    background: "#0f172a",
    border: "1px solid #0f172a",
  },
  tierName: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 2,
  },
  tierDesc: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 1.4,
  },
  infoBox: {
    marginTop: 8,
    padding: "10px 14px",
    background: "#f0f9ff",
    borderRadius: 8,
    fontSize: 12,
    color: "#0369a1",
    lineHeight: 1.5,
  },
  errorBox: {
    marginBottom: 16,
    padding: "10px 14px",
    background: "#fff0f0",
    borderRadius: 8,
    fontSize: 13,
    color: "#c0392b",
  },
  btnPrimary: {
    width: "100%",
    padding: "12px 24px",
    fontSize: 15,
    fontWeight: 600,
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "-0.01em",
    marginTop: 8,
  },
  // Loading
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
  loadingInner: {
    textAlign: "center" as const,
  },
  radar: {
    position: "relative" as const,
    width: 80,
    height: 80,
    margin: "0 auto 24px",
  },
  radarRing1: {
    position: "absolute" as const,
    inset: 0,
    borderRadius: "50%",
    border: "2px solid #0f172a",
    opacity: 0.15,
    animation: "ping 1.5s ease-out infinite",
  },
  radarRing2: {
    position: "absolute" as const,
    inset: 10,
    borderRadius: "50%",
    border: "2px solid #0f172a",
    opacity: 0.25,
    animation: "ping 1.5s ease-out infinite 0.3s",
  },
  radarRing3: {
    position: "absolute" as const,
    inset: 20,
    borderRadius: "50%",
    border: "2px solid #0f172a",
    opacity: 0.4,
    animation: "ping 1.5s ease-out infinite 0.6s",
  },
  radarDot: {
    position: "absolute" as const,
    inset: 34,
    borderRadius: "50%",
    background: "#0f172a",
  },
  loadingMsg: {
    fontSize: 14,
    color: "#475569",
    margin: "0 0 8px",
  },
  loadingEmoji: {
    fontSize: 24,
    margin: 0,
    animation: "bounce 1s ease-in-out infinite",
  },
  // Result
  resultWrap: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "2rem 1.5rem",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
    flexWrap: "wrap" as const,
    gap: 12,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: 700,
    margin: "0 0 8px",
    color: "#0f172a",
    letterSpacing: "-0.03em",
  },
  resultMeta: {
    display: "flex",
    gap: 8,
  },
  tierBadge: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 99,
    background: "#0f172a",
    color: "#fff",
    fontWeight: 500,
  },
  scoreBadge: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 99,
    background: "#f0fdf4",
    color: "#166534",
    border: "1px solid #bbf7d0",
    fontWeight: 500,
  },
  discoveryBadge: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 99,
    background: "#eff6ff",
    color: "#1e40af",
    border: "1px solid #bfdbfe",
    fontWeight: 600,
    animation: "pulse 2s infinite",
  },
  resultActions: {
    display: "flex",
    gap: 8,
  },
  btnDownload: {
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 500,
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnReset: {
    padding: "8px 16px",
    fontSize: 13,
    background: "transparent",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  card: {
    background: "#fff",
    border: "1px solid #f1f5f9",
    borderRadius: 12,
    padding: "16px 18px",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
    margin: "0 0 12px",
  },
  cardText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.6,
    margin: 0,
  },
  diagTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  },
  diagLabel: {
    padding: "6px 0",
    color: "#94a3b8",
    whiteSpace: "nowrap" as const,
    paddingRight: 12,
    verticalAlign: "top" as const,
  },
  diagValue: {
    padding: "6px 0",
    color: "#334155",
    lineHeight: 1.5,
    verticalAlign: "top" as const,
  },
  atacqueItem: { marginBottom: 12 },
  ataqueLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    display: "block",
    marginBottom: 4,
  },
  ataqueText: {
    fontSize: 13,
    color: "#334155",
    margin: 0,
    lineHeight: 1.5,
  },
  auditItem: { marginBottom: 10 },
  auditLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    display: "block",
    marginBottom: 4,
  },
  auditText: {
    fontSize: 12,
    color: "#64748b",
    margin: 0,
    lineHeight: 1.5,
  },
  confidenceBadge: {
    marginTop: 12,
    fontSize: 11,
    padding: "4px 8px",
    background: "#fefce8",
    color: "#854d0e",
    borderRadius: 6,
    display: "inline-block",
  },
  tagsWrap: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
  },
  tag: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 99,
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
  },
  feedbackWrap: {
    marginTop: "2rem",
    padding: "20px",
    background: "#f8fafc",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    textAlign: "center" as const,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 8,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: "1.5rem",
  },
  feedbackBtnWrap: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  feedbackBtn: {
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  feedbackBtnActive: {
    background: "#0f172a",
    color: "#fff",
    borderColor: "#0f172a",
  },
  feedbackInputWrap: {
    marginTop: 12,
    animation: "fadeIn 0.3s ease-out",
  },
  feedbackThanks: {
    fontSize: 14,
    color: "#166534",
    fontWeight: 500,
    padding: "8px",
    background: "#f0fdf4",
    borderRadius: 8,
  },
  smartPanel: {
    padding: "20px",
    background: "#f8fafc",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    marginBottom: "2rem",
  },
};

const smartStyles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    fontSize: 14,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    outline: "none",
    background: "#fff",
    fontFamily: "inherit",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  btn: {
    padding: "0 20px",
    fontSize: 13,
    fontWeight: 600,
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  bubble: {
    padding: "12px 16px",
    borderRadius: "12px 12px 12px 4px",
    fontSize: 13,
    marginBottom: 16,
    border: "1px solid",
    lineHeight: 1.5,
  }
};
