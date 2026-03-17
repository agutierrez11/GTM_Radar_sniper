"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ContactCard from "./ContactCard";
import CommentsSection from "./CommentsSection";

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

interface NexusResult {
  empresa: string;
  tier: string;
  icp_score: number;
  latido_mercado: string;
  diagnostico: {
    resfriado: string;
    gripe: string;
    panuelo: string;
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
  competidores: string[];
  markdown: string;
  discovery_mode?: boolean;
  logId?: number;
}

// ── Constants ──────────────────────────────────────────────────────────
const PAISES = [
  "México", "Colombia", "Brasil", "Chile",
  "Argentina", "Perú", "Toda Latam",
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

// ── Supabase Client ────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      <p style={styles.feedbackSubtitle}>Ayúdanos a calibrar la inteligencia de Nexus Architect.</p>
      
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
export default function NexusForm() {
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
  const [result, setResult] = useState<NexusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [nexusResponse, setNexusResponse] = useState<{
    msg: string | null;
    type: "guide" | "error" | "success" | null;
  }>({ msg: "¡Hola! ¿Qué empresa quieres analizar hoy? (Ej: Nuvei en Brasil)", type: "guide" });

  const LOADING_MSGS = [
    "Consultando universo Fintech Latam...",
    "Activando protocolo Nexus Architect...",
    "Detectando latido del mercado...",
    "Calculando Schwerpunkt...",
    "Identificando el pañuelo antes del estornudo...",
    "Auditando sesgos...",
    "Generando ficha de ataque...",
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
            msg: `🛡️ Acceso Denegado: ${data.motivo_rechazo || "Nexus se enfoca solo en Fintech, Payments y Retailers de alto impacto para garantizar calidad."}`, 
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
      setNexusResponse({ msg: "Hubo un error en la conexión con el motor Nexus.", type: "error" });
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

  const handleSubmit = async () => {
    if (!brief.empresa || !brief.producto || !brief.pais || !brief.vertical) {
      setError("Completa empresa, producto, país y vertical.");
      return;
    }

    setError(null);
    setLoading(true);
    setStep("loading");

    // Rotar mensajes de carga
    let msgIdx = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[msgIdx]);
    }, 2000);

    try {
      // 1. Buscar empresa en Supabase
      const { data: empresaData } = await supabase
        .from("empresas_v2")
        .select("*")
        .ilike("name", `%${brief.empresa}%`)
        .limit(5);

      // 2. Buscar similares en benchmark
      const { data: benchmarkData } = await supabase
        .from("benchmark_raw")
        .select("empresa_similar, segmento")
        .ilike("empresa_origen", `%${brief.empresa}%`)
        .limit(10);

      // 3. Buscar competidores en misma vertical
      const { data: competidoresData } = await supabase
        .from("empresas_v2")
        .select("name, website")
        .eq("country", brief.pais.replace("México", "Mexico"))
        .ilike("vertical_finnovista", `%${brief.vertical.split(" ")[0]}%`)
        .order("icp_score", { ascending: false })
        .limit(8);

      // 4. Llamar al Nexus Architect API
      const response = await fetch("/api/nexus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          empresa_supabase: empresaData?.[0] || null,
          benchmark: benchmarkData || [],
          competidores: competidoresData || [],
        }),
      });

      if (!response.ok) throw new Error("Error en el análisis");

      const data: NexusResult = await response.json();
      setResult(data);
      setStep("result");
    } catch (err) {
      setError("Error generando la estrategia. Intenta de nuevo.");
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
    a.download = `${result.empresa.replace(/\s+/g, "_")}_nexus.md`;
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
          {/* Latido */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>💓 Latido del Mercado</h3>
            <p style={styles.cardText}>{result.latido_mercado}</p>
          </div>

          {/* Diagnóstico */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🔬 Diagnóstico Nexus</h3>
            <table style={styles.diagTable}>
              <tbody>
                <tr>
                  <td style={styles.diagLabel}>🤧 Resfriado</td>
                  <td style={styles.diagValue}>{result.diagnostico.resfriado}</td>
                </tr>
                <tr>
                  <td style={styles.diagLabel}>🤒 Gripe</td>
                  <td style={styles.diagValue}>{result.diagnostico.gripe}</td>
                </tr>
                <tr>
                  <td style={styles.diagLabel}>🤝 Pañuelo</td>
                  <td style={styles.diagValue}>{result.diagnostico.panuelo}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Plan de Ataque */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⚔️ Plan de Ataque</h3>
            <div style={styles.atacqueItem}>
              <span style={styles.ataqueLabel}>Schwerpunkt</span>
              <p style={styles.ataqueText}>{result.plan_ataque.schwerpunkt}</p>
            </div>
            <div style={styles.atacqueItem}>
              <span style={styles.ataqueLabel}>Flanqueo</span>
              <p style={styles.ataqueText}>{result.plan_ataque.flanqueo}</p>
            </div>
            <div style={{ ...styles.atacqueItem, background: "#f0fdf4", borderRadius: 8, padding: "10px 12px" }}>
              <span style={styles.ataqueLabel}>Apertura recomendada</span>
              <p style={{ ...styles.ataqueText, fontStyle: "italic" }}>
                "{result.plan_ataque.apertura}"
              </p>
            </div>
          </div>

          {/* Auditoría */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🧠 Auditoría RaiSE</h3>
            <div style={styles.auditItem}>
              <span style={styles.auditLabel}>⚠️ Abogado del Diablo</span>
              <p style={styles.auditText}>{result.auditoria.abogado_diablo}</p>
            </div>
            <div style={styles.auditItem}>
              <span style={styles.auditLabel}>🔍 Sesgo detectado</span>
              <p style={styles.auditText}>{result.auditoria.sesgo}</p>
            </div>
            <div style={styles.confidenceBadge}>
              Confianza general: {result.auditoria.confianza}
            </div>
          </div>

          {/* Similares */}
          {result.similares.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🔗 Similares en el ecosistema</h3>
              <div style={styles.tagsWrap}>
                {result.similares.map((s) => (
                  <span key={s} style={styles.tag}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Competidores */}
          {result.competidores.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>⚔️ Competidores directos</h3>
              <div style={styles.tagsWrap}>
                {result.competidores.map((c) => (
                  <span key={c} style={{ ...styles.tag, background: "#fff0f0", color: "#c0392b" }}>
                    {c}
                  </span>
                ))}
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
      <div style={styles.header}>
        <span style={styles.headerIcon}>🛰️</span>
        <div>
          <h1 style={styles.title}>Nexus Architect</h1>
          <p style={styles.subtitle}>
            Inteligencia GTM — Ecosistema Fintech Latam
          </p>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.section}>
        <label style={styles.sectionLabel}>Tu empresa</label>
        <div style={styles.field}>
          <label style={styles.label}>Nombre de tu empresa</label>
          <input
            style={styles.input}
            name="empresa"
            value={brief.empresa}
            onChange={handleChange}
            placeholder="Ej. Sumsub, EBANX, Stripe..."
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>¿Qué vendes?</label>
          <textarea
            style={styles.textarea}
            name="producto"
            value={brief.producto}
            onChange={handleChange}
            placeholder="Describe tu producto o servicio principal..."
          />
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <label style={styles.sectionLabel}>Mercado objetivo</label>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>País</label>
            <select
              style={styles.select}
              name="pais"
              value={brief.pais}
              onChange={handleChange}
            >
              <option value="">Selecciona...</option>
              {PAISES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Vertical</label>
            <select
              style={styles.select}
              name="vertical"
              value={brief.vertical}
              onChange={handleChange}
            >
              <option value="">Selecciona...</option>
              {VERTICALES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>
            Buyer persona{" "}
            <span style={styles.optional}>opcional</span>
          </label>
          <input
            style={styles.input}
            name="buyer"
            value={brief.buyer}
            onChange={handleChange}
            placeholder="Ej. CTO de neobanco, VP Compliance fintech Serie B..."
          />
        </div>
      </div>

      <div style={styles.section}>
        <label style={styles.sectionLabel}>Tipo de deal</label>
        <div style={styles.tierGrid}>
          {TIERS.map((t) => (
            <div
              key={t.id}
              style={{
                ...styles.tierCard,
                ...(brief.tier === t.id ? styles.tierCardActive : {}),
              }}
              onClick={() => setBrief((p) => ({ ...p, tier: t.id as GTMBrief["tier"] }))}
            >
              <div style={styles.tierName}>{t.nombre}</div>
              <div style={styles.tierDesc}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <label style={styles.sectionLabel}>
          Inteligencia competitiva{" "}
          <span style={styles.optional}>opcional</span>
        </label>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>URL competidor principal</label>
            <input
              style={styles.input}
              name="url_competidor"
              value={brief.url_competidor}
              onChange={handleChange}
              placeholder="https://competidor.com"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>URL cliente ideal</label>
            <input
              style={styles.input}
              name="url_cliente_ideal"
              value={brief.url_cliente_ideal}
              onChange={handleChange}
              placeholder="https://clienteideal.com"
            />
          </div>
        </div>
        <div style={styles.infoBox}>
          El Nexus Architect consultará las 2,500+ empresas del ecosistema
          Fintech Latam para generar tu ficha de ataque personalizada.
        </div>
      </div>

      <div style={styles.smartPanel}>
        <label style={styles.sectionLabel}>🛰️ Nexus Smart Discovery</label>
        
        {/* Nexus Dialogue Bubble */}
        {nexusResponse.msg && (
          <div style={{
            ...smartStyles.bubble, 
            backgroundColor: nexusResponse.type === "error" ? "#fef2f2" : nexusResponse.type === "success" ? "#f0fdf4" : "#f0f9ff",
            borderColor: nexusResponse.type === "error" ? "#fee2e2" : nexusResponse.type === "success" ? "#dcfce7" : "#e0f2fe",
            color: nexusResponse.type === "error" ? "#991b1b" : nexusResponse.type === "success" ? "#166534" : "#075985",
          }}>
            {nexusResponse.msg}
          </div>
        )}

        <div style={smartStyles.container}>
          <input
            style={smartStyles.input}
            placeholder="Ej: Soy de Nuvei y busco casinos en Colombia..."
            value={smartPrompt}
            onChange={(e) => setSmartPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSmartDiscovery()}
            disabled={parsing}
          />
          <button 
            style={smartStyles.btn} 
            onClick={handleSmartDiscovery}
            disabled={parsing || !smartPrompt}
          >
            {parsing ? "🛰️ Analizando..." : "Auto-rellenar ⚡"}
          </button>
        </div>
      </div>

      <button style={styles.btnPrimary} onClick={handleSubmit}>
        Generar estrategia de ataque →
      </button>
      <ContactCard />
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
