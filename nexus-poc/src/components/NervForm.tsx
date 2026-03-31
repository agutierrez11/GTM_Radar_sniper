"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import ContactCard from "./ContactCard";
import ReportView from "./ReportView";

// ── Types ──────────────────────────────────────────────────────────────
interface GTMBrief {
  empresa: string;
  producto: string;
  tier: "Tier1" | "Tier2" | "Tier3";
}

interface NervResult {
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
  competidores: { name: string; url: string | null }[];
  clientes_potenciales?: { name: string; url: string | null }[];
  markdown: string;
  logId?: number;
  empresaId?: number;
}

// ── Constants ──────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "Tier1",
    nombre: "Primera reunión — nunca hemos hablado",
    desc: "Schwerpunkt · Sandler",
  },
  {
    id: "Tier2",
    nombre: "Ya hay interés — están evaluando",
    desc: "Flanqueo · SPIN selling",
  },
  {
    id: "Tier3",
    nombre: "Necesito cerrar — empujar decisión",
    desc: "BANT · Closing Protocol",
  },
] as const;

// ── Main Component ─────────────────────────────────────────────────────
export default function NervForm() {
  const [brief, setBrief] = useState<GTMBrief>({
    empresa: "",
    producto: "",
    tier: "Tier1",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NervResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [loadingMsg, setLoadingMsg] = useState("");

  const LOADING_MSGS = [
    "Consultando universo Fintech Latam...",
    "Activando protocolo NERV...",
    "Detectando latido del mercado...",
    "Calculando Foco estratégico...",
    "Auditando sesgos...",
    "Generando ficha de ataque...",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBrief((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!brief.empresa || !brief.producto) {
      setError("Completa qué empresa quieres atacar y qué vendes tú.");
      return;
    }

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
      // Inference from Supabase
      let empresaData = null;
      try {
        const { data: searchData } = await supabase
          .from("empresas_v2")
          .select("*")
          .ilike("name", `%${brief.empresa}%`)
          .limit(1);
        if (searchData && searchData.length > 0) {
          empresaData = searchData[0];
        }
      } catch (e) {
        console.warn("Inference failed", e);
      }

      const response = await fetch("/api/nexus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          empresa_supabase: empresaData || null,
          is_minimal: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el análisis");
      }

      const data: NervResult = await response.json();
      setResult({ ...data, empresaId: empresaData?.id });
      setStep("result");
    } catch (err: any) {
      setError(err.message || "Error generando la estrategia.");
      setStep("form");
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleShare = async () => {
    if (!result) return;
    setSharing(true);
    try {
      const resp = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: result }),
      });
      if (!resp.ok) throw new Error("No se pudo generar el enlace");
      const { id } = await resp.json();
      const url = `${window.location.origin}/r/${id}`;
      setShareUrl(url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSharing(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setResult(null);
    setError(null);
    setShareUrl(null);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob(["\ufeff", result.markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.empresa.replace(/\s+/g, "_")}_nerv.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Render Helpers ───────────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingInner}>
          <div style={styles.radar}>
            <div style={styles.radarRing1} />
            <div style={{ ...styles.radarRing1, animationDelay: "0.3s" }} />
            <div style={{ ...styles.radarRing1, animationDelay: "0.6s" }} />
          </div>
          <p style={styles.loadingMsg}>{loadingMsg}</p>
        </div>
      </div>
    );
  }

  if (step === "result" && result) {
    return (
      <div style={styles.resultWrap}>
        <div style={styles.resultHeader}>
          <h1 style={styles.resultTitle}>{result.empresa}</h1>
          <div style={styles.resultActions}>
            <button
              style={styles.btnShare}
              onClick={handleShare}
              disabled={sharing}
            >
              {sharing ? "..." : "Compartir 🔗"}
            </button>
            <button style={styles.btnDownload} onClick={handleDownload}>
              .md
            </button>
            <button style={styles.btnReset} onClick={handleReset}>
              Nueva
            </button>
          </div>
        </div>
        {shareUrl && (
          <div style={styles.shareBox}>
            <input
              readOnly
              value={shareUrl}
              style={styles.shareInput}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
        )}
        <ReportView result={result} styles={styles} />
      </div>
    );
  }

  return (
    <div style={styles.wrap} className="nerv-container">
      <style jsx global>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(3); opacity: 0; }
        }
        @media (max-width: 480px) {
          .nerv-container { max-width: 100% !important; padding: 1.5rem 1rem !important; }
          .nerv-tier-grid { grid-template-columns: 1fr !important; }
          .nerv-tier-card { width: 100% !important; margin-bottom: 8px !important; }
          button, input, textarea { min-height: 52px !important; font-size: 16px !important; }
          .nerv-tier-name { font-size: 13px !important; }
          .nerv-tier-desc { font-size: 10px !important; }
        }
      `}</style>

      <div style={styles.header}>
        <span style={styles.headerIcon}>🛰️</span>
        <div>
          <h1 style={styles.title}>NERV</h1>
          <p style={styles.subtitle}>Ecosistema de Inteligencia GTM</p>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.section}>
        <div style={styles.field}>
          <label style={styles.label}>¿Con qué empresa quieres cerrar?</label>
          <input
            style={styles.input}
            name="empresa"
            placeholder="Ej. Klar, Veriph.One, Nowports..."
            value={brief.empresa}
            onChange={handleChange}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>¿Qué vendes tú?</label>
          <textarea
            style={styles.textarea}
            name="producto"
            placeholder="Ej. Agentes de voz con IA para cobranza..."
            value={brief.producto}
            onChange={handleChange}
          />
        </div>
      </div>

      <div style={styles.section}>
        <label style={styles.sectionLabel}>Etapa del deal (opcional)</label>
        <div style={styles.tierGrid} className="nerv-tier-grid">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className="nerv-tier-card"
              style={{
                ...styles.tierCard,
                ...(brief.tier === t.id ? styles.tierCardActive : {}),
              }}
              onClick={() =>
                setBrief((p) => ({ ...p, tier: t.id as GTMBrief["tier"] }))
              }
            >
              <div
                className="nerv-tier-name"
                style={{
                  ...styles.tierName,
                  ...(brief.tier === t.id ? { color: "#fff" } : {}),
                }}
              >
                {t.nombre}
              </div>
              <div
                className="nerv-tier-desc"
                style={{
                  ...styles.tierDesc,
                  ...(brief.tier === t.id ? { color: "#94a3b8" } : {}),
                  fontSize: 10,
                }}
              >
                {t.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button style={styles.btnPrimary} onClick={handleSubmit}>
        Generar estrategia de ataque →
      </button>

      <div style={{ ...styles.infoBox, textAlign: "center", marginTop: 32 }}>
        NERV infiere país, vertical y competidores automáticamente.
      </div>

      <ContactCard />
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrap: {
    maxWidth: 600,
    margin: "0 auto",
    padding: "3rem 1.5rem",
    fontFamily: "'DM Sans', sans-serif",
    color: "#0f172a",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: "2.5rem",
  },
  headerIcon: { fontSize: 32 },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.04em",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    margin: "2px 0 0",
  },
  section: { marginBottom: "1.5rem" },
  sectionLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: 12,
  },
  field: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 15,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    fontSize: 15,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
    fontFamily: "inherit",
    minHeight: 100,
    lineHeight: 1.6,
    resize: "vertical",
  },
  tierGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 8,
  },
  tierCard: {
    padding: "16px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tierCardActive: {
    background: "#0f172a",
    borderColor: "#0f172a",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
  },
  tierName: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
  },
  tierDesc: {
    fontSize: 12,
    color: "#64748b",
  },
  btnPrimary: {
    width: "100%",
    padding: "16px",
    fontSize: 16,
    fontWeight: 700,
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    marginTop: 12,
    transition: "transform 0.1s",
  },
  infoBox: {
    padding: "12px",
    background: "#f1f5f9",
    borderRadius: 10,
    fontSize: 12,
    color: "#64748b",
  },
  errorBox: {
    padding: "12px",
    background: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: 10,
    color: "#991b1b",
    fontSize: 14,
    marginBottom: 16,
  },
  // Loading
  loadingWrap: { height: 400, display: "flex", alignItems: "center", justifyContent: "center" },
  loadingInner: { textAlign: "center" },
  loadingMsg: { fontSize: 14, color: "#64748b", fontWeight: 500 },
  radar: { width: 60, height: 60, margin: "0 auto 20px", position: "relative" },
  radarRing1: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "2px solid #0f172a",
    animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
  },
  // Result
  resultWrap: { maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: 16 },
  resultTitle: { fontSize: 32, fontWeight: 800, margin: 0 },
  resultActions: { display: "flex", gap: 8 },
  btnShare: { padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", border: "none", cursor: "pointer", fontWeight: 600 },
  btnDownload: { padding: "8px 16px", borderRadius: 8, background: "#0f172a", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 },
  btnReset: { padding: "8px 16px", borderRadius: 8, background: "#fff", border: "1px solid #e2e8f0", cursor: "pointer", fontWeight: 600 },
  shareBox: { marginBottom: 16, padding: 12, background: "#f8fafc", borderRadius: 8 },
  shareInput: { width: "100%", padding: 8, border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 },
};
