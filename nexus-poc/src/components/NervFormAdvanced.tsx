"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Markdown from "markdown-to-jsx";
import ContactCard from "./ContactCard";
import CommentsSection from "./CommentsSection";
import { MarketPulse } from "./MarketPulse";

// ── Types ──────────────────────────────────────────────────────────────
interface GTMBriefAdvanced {
  vendedorUrl: string;
  objetivoUrl: string;
  pais: string;
  vertical: string;
  buyer: string;
  tier: "Tier1" | "Tier2" | "Tier3";
  productosSeleccionados: string[];
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
  logId?: number;
  empresaId?: number;
}

interface Prospect {
  empresa: string;
  url?: string;
  sector: string;
  dolor: string;
  gancho: string;
  score: number;
}

interface SimulationResult {
  escenario: string;
  simulacion: Array<{ minuto: number; accion: string; reaccion_prospecto: string; probabilidad_exito: number }>;
  card_report: {
    summary: string;
    narrative_spread: string;
    critical_risk: string;
    success_score: number;
  };
  follow_up: string;
}

interface PortfolioResult {
  portfolio: Prospect[];
  estrategia_macro: string;
}

interface DiscoveredProduct {
  nombre: string;
  descripcion: string;
}

// ── Constants ──────────────────────────────────────────────────────────
const PAISES_LATAM = [
  "México", "Colombia", "Brasil", "Chile",
  "Argentina", "Perú", "Toda Latam",
];

const VERTICALES = [
  "Payments & Remittances", "Lending", "Digital Banking",
  "Tech Infrastructure", "Open Finance", "Insurtech",
  "Enterprise Financial Mgmt", "Crypto & Blockchain",
  "Wealth Management", "Proptech", "Crowdfunding",
  "Personal Financial Management", "General / Otras Industrias",
];

const TIERS = [
  { id: "Tier1", nombre: "Tier 1 — Estratégico", desc: "MEDDICII · Schwerpunkt", color: "#1a1a2e" },
  { id: "Tier2", nombre: "Tier 2 — Técnico", desc: "Flanqueo · SPIN selling", color: "#16213e" },
  { id: "Tier3", nombre: "Tier 3 — Volumen", desc: "Predictable Revenue", color: "#0f3460" },
] as const;

// ── Main Component ─────────────────────────────────────────────────────
export default function NervFormAdvanced() {
  const [brief, setBrief] = useState<GTMBriefAdvanced>({
    vendedorUrl: "",
    objetivoUrl: "",
    pais: "México",
    vertical: "Payments & Remittances",
    buyer: "",
    tier: "Tier1",
    productosSeleccionados: [],
  });

  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [discoveredProducts, setDiscoveredProducts] = useState<DiscoveredProduct[]>([]);
  const [empresaName, setEmpresaName] = useState("");
  
  const [step, setStep] = useState<"form" | "loading" | "result" | "portfolio">("form");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [result, setResult] = useState<NervResult | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResult | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loadingSim, setLoadingSim] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScanProducts = async () => {
    if (!brief.vendedorUrl) {
      setError("Ingresa la URL de tu empresa para escanear productos.");
      return;
    }
    setScanning(true);
    setError(null);
    try {
      const resp = await fetch("/api/discover-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: brief.vendedorUrl }),
      });
      if (!resp.ok) throw new Error("Error escaneando productos");
      const data = await resp.json();
      setDiscoveredProducts(data.productos || []);
      setEmpresaName(data.empresa || "");
    } catch (err) {
      setError("No se pudieron extraer los productos. Intenta de nuevo o ingresa detalles manualmente.");
    } finally {
      setScanning(false);
    }
  };

  const toggleProduct = (prod: string) => {
    setBrief((prev: GTMBriefAdvanced) => ({
      ...prev,
      productosSeleccionados: prev.productosSeleccionados.includes(prod)
        ? prev.productosSeleccionados.filter(p => p !== prod)
        : [...prev.productosSeleccionados, prod]
    }));
  };

  const handleSubmit = async () => {
    if (!brief.vendedorUrl) {
      setError("Ingresa la URL de tu empresa para el análisis.");
      return;
    }
    setLoading(true);
    setStep("loading");
    setLoadingMsg(brief.objetivoUrl ? "Iniciando Escaneo de Inteligencia Dual..." : "Generando Análisis de Mercado Estratégico...");

    try {
      const resp = await fetch("/api/nexus-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...brief,
          empresaName,
          contexto_productos: discoveredProducts.filter(p => brief.productosSeleccionados.includes(p.nombre))
        }),
      });
      if (!resp.ok) throw new Error("Error en el análisis nexus-v2");
      const data = await resp.json();
      setResult(data);
      setStep("result");
    } catch (err: any) {
      setError(err.message || "Error generando la estrategia.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!result) return;
    setLoadingSim(true);
    setSimulation(null);
    try {
      const resp = await fetch("/api/oasis-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossier: result, context: brief }),
      });
      const data = await resp.json();
      setSimulation(data);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoadingSim(false);
    }
  };

  const handleGeneratePortfolio = async () => {
    if (!brief.vendedorUrl) {
      setError("Ingresa la URL de tu empresa para prospectar.");
      return;
    }
    setLoading(true);
    setStep("loading");
    setLoadingMsg("Analizando Mercado y Generando Hit List de Alta Fidelidad...");

    try {
      const resp = await fetch("/api/prospect-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...brief, empresaName }),
      });
      if (!resp.ok) throw new Error("Error generando el portafolio");
      const data = await resp.json();
      setPortfolio(data);
      setStep("portfolio");
    } catch (err: any) {
      setError(err.message || "Error al prospectar.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const localStyles = {
    ...styles,
    scanBtn: {
      padding: "8px 16px",
      fontSize: 12,
      fontWeight: 600,
      background: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      marginTop: 8
    },
    productTag: (active: boolean) => ({
      padding: "8px 12px",
      borderRadius: 12,
      border: "1px solid",
      borderColor: active ? "#3b82f6" : "#e2e8f0",
      background: active ? "#eff6ff" : "white",
      color: active ? "#1e40af" : "#64748b",
      fontSize: 13,
      cursor: "pointer",
      transition: "all 0.2s",
      textAlign: "left" as const
    })
  };

  if (step === "loading") return <div style={styles.loadingWrap}><p>{loadingMsg}</p></div>;

  if (step === "portfolio" && portfolio) {
    return (
      <div style={styles.resultWrap}>
        <div style={styles.resultHeader}>
          <h1 style={styles.resultTitle}>Hit List: <span style={{ color: "#3b82f6" }}>{brief.vertical} en {brief.pais}</span></h1>
          <button style={styles.btnReset} onClick={() => setStep("form")}>Nueva Búsqueda</button>
        </div>

        <div className="bg-zinc-900 text-white p-6 rounded-2xl my-8">
           <div className="text-[10px] font-bold text-blue-400 uppercase mb-2 tracking-widest">Estrategia Macro</div>
           <div className="text-lg font-light leading-relaxed">{portfolio.estrategia_macro}</div>
        </div>

        <div className="overflow-hidden border border-zinc-200 rounded-2xl bg-white shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left py-4 px-6 text-xs font-bold text-zinc-500 uppercase">Empresa</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-zinc-500 uppercase">Dolor Crítico</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-zinc-500 uppercase">Gancho IRRESISTIBLE</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-zinc-500 uppercase">ICP</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-zinc-500 uppercase">Forensic</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.portfolio.map((p, idx) => (
                <tr key={idx} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-zinc-900">{p.empresa}</div>
                    <div className="text-[10px] text-zinc-400 font-medium uppercase mt-1">{p.sector}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-zinc-600 italic">"{p.dolor}"</td>
                  <td className="py-4 px-6 text-sm font-medium text-blue-700 bg-blue-50/30">{p.gancho}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-block px-3 py-1 bg-zinc-900 text-white text-[10px] font-black rounded-full">
                      {p.score}%
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => {
                        setBrief(prev => ({ ...prev, objetivoUrl: p.url || "" }));
                        setTimeout(handleSubmit, 100);
                      }}
                      className="bg-blue-600 text-white text-[10px] px-2 py-1.5 rounded font-bold uppercase hover:bg-blue-700 transition-colors"
                    >
                      Analizar →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (step === "result" && result) {
    return (
      <div style={styles.resultWrap}>
        <div style={styles.resultHeader}>
          <h1 style={styles.resultTitle}>{result.empresa} <span style={{ color: "#3b82f6" }}>Advanced Mode</span></h1>
          <button style={styles.btnReset} onClick={() => setStep("form")}>Nueva Consulta</button>
        </div>

        {/* New Stats Layers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
           <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">ICP alignment</div>
              <div className="text-2xl font-black text-blue-900">{result.icp_score || 94}%</div>
              <div className="text-[10px] text-blue-400 mt-1">Surgical Fit Detected</div>
           </div>
           <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Market Latency</div>
              <div className="text-2xl font-black text-indigo-900">High</div>
              <div className="text-[10px] text-indigo-400 mt-1">Ready for Flanking</div>
           </div>
           <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Signal Confidence</div>
              <div className="text-2xl font-black text-zinc-900">{result.auditoria?.confianza || "ALTA"}</div>
              <div className="text-[10px] text-zinc-400 mt-1">Evidence-Based Research</div>
           </div>
        </div>
        
        <div className="prose prose-zinc max-w-none">
          <Markdown
            options={{
              overrides: {
                h1: { props: { className: "text-2xl font-bold mt-6 mb-4 text-zinc-900 border-b pb-2" } },
                h2: { props: { className: "text-xl font-semibold mt-5 mb-3 text-zinc-800" } },
                h3: { props: { className: "text-lg font-medium mt-4 mb-2 text-zinc-700" } },
                p: { props: { className: "mb-4 text-zinc-600 leading-relaxed" } },
                ul: { props: { className: "list-disc pl-6 mb-4 space-y-2" } },
                li: { props: { className: "text-zinc-600" } },
                strong: { props: { className: "font-bold text-zinc-900" } },
                blockquote: { props: { className: "border-l-4 border-blue-500 pl-4 py-2 italic bg-blue-50 rounded-r-lg my-4 text-zinc-700" } },
              }
            }}
          >
            {result.markdown}
          </Markdown>
        </div>

        {/* OASIS SIMULATION CARD (MiroFish Protocol) */}
        {!simulation ? (
          <div className="mt-12 p-10 bg-zinc-950 rounded-3xl border border-zinc-800 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            <h3 className="text-white text-xl font-black mb-2 tracking-tight">OASIS Simulation Engine</h3>
            <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Ejecuta el protocolo MiroFish (Seed → Simulation → Report) para predecir la reacción del prospecto y el Narrative Spread.
            </p>
            <button 
              onClick={runSimulation}
              disabled={loadingSim}
              className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] disabled:opacity-50"
            >
              {loadingSim ? "Simulando ENCUENTRO..." : "Run Prediction Scenario 🔥"}
            </button>
          </div>
        ) : (
          <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-zinc-900 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
              <div className="bg-zinc-800/80 px-8 py-5 border-b border-white/5 flex justify-between items-center backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,1)]" />
                  <span className="text-blue-400 font-black text-[10px] uppercase tracking-widest leading-none">MiroFish v1.1 Simulation</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <div className="text-[9px] text-zinc-500 font-black uppercase leading-none mb-1">Success Score</div>
                      <div className="text-blue-400 font-black text-xl leading-none">{simulation.card_report.success_score}%</div>
                   </div>
                </div>
              </div>

              <div className="p-10">
                <div className="mb-12">
                  <h2 className="text-2xl font-black text-white tracking-tight leading-tight mb-3">
                    {simulation.escenario}
                  </h2>
                  <div className="w-12 h-1 bg-blue-600 rounded-full" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
                   <div className="space-y-8 relative">
                      <div className="absolute left-[11px] top-4 bottom-4 w-px bg-zinc-800" />
                      {simulation.simulacion.map((step, idx) => (
                        <div key={idx} className="relative pl-10 group">
                          <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center z-10 group-hover:border-blue-500 transition-colors">
                             <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-blue-400 transition-colors" />
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Minuto {step.minuto}</span>
                             <div className="h-px flex-1 bg-zinc-800/50" />
                             <span className="text-[10px] font-bold text-blue-500/60 font-mono">{step.probabilidad_exito}% Confidence</span>
                          </div>
                          <h4 className="text-white font-bold text-lg mb-2">{step.accion}</h4>
                          <p className="text-zinc-500 text-sm leading-relaxed">{step.reaccion_prospecto}</p>
                        </div>
                      ))}
                   </div>

                   <div className="space-y-6">
                      <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                         <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 block">Narrative Spread</span>
                         <p className="text-zinc-400 text-sm leading-relaxed italic">
                           "{simulation.card_report.narrative_spread}"
                         </p>
                      </div>
                      <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20">
                         <span className="text-[9px] font-black text-red-500/80 uppercase tracking-[0.2em] mb-4 block">Critical Risk Factor</span>
                         <p className="text-red-200/60 text-sm leading-relaxed italic">
                           {simulation.card_report.critical_risk}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5">
                   <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">MiroFish Follow-up Path</span>
                      <div className="h-px flex-1 mx-6 bg-white/5" />
                   </div>
                   <div className="bg-black/50 p-8 rounded-2xl border border-white/5 font-mono text-zinc-400 text-sm leading-loose relative group cursor-pointer hover:border-blue-500/30 transition-all">
                      <div className="absolute top-4 right-4 text-[9px] text-zinc-600 font-black group-hover:text-blue-400 transition-colors">CLICK TO COPY FLOW</div>
                      "{simulation.follow_up}"
                   </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => setSimulation(null)}
                className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hover:text-white transition-all py-2 px-4 border border-zinc-800 rounded-full hover:border-zinc-500"
              >
                ← Reset Prediction Engine
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-12 border-t border-zinc-100 pt-12" />
        <MarketPulse empresaId={result.empresaId || 0} empresaNombre={result.empresa} />
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <h2 style={styles.title}>NERV Advanced: Dual URL Intelligence</h2>
      <p style={styles.subtitle}>Análisis de PMF y Estrategia de Venta.</p>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.section}>
        <label style={styles.sectionLabel}>Tu Empresa</label>
        <div style={styles.field}>
          <label style={styles.label}>URL de la empresa que vende</label>
          <input 
            style={styles.input} 
            value={brief.vendedorUrl} 
            onChange={e => setBrief({...brief, vendedorUrl: e.target.value})}
            placeholder="https://tuempresa.com"
          />
          <button style={localStyles.scanBtn} onClick={handleScanProducts} disabled={scanning}>
            {scanning ? "⌛ Escaneando..." : "🔍 Descubrir Productos"}
          </button>
        </div>

        {discoveredProducts.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <label style={styles.label}>¿Qué quieres vender hoy?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8, marginTop: 8 }}>
              {discoveredProducts.map(p => (
                <div 
                  key={p.nombre} 
                  style={localStyles.productTag(brief.productosSeleccionados.includes(p.nombre))}
                  onClick={() => toggleProduct(p.nombre)}
                >
                  <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                  <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>{p.descripcion}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <label style={styles.sectionLabel}>Empresa Objetivo</label>
        <div style={styles.field}>
          <label style={styles.label}>URL de la empresa a quien quieres vender</label>
          <input 
            style={styles.input} 
            value={brief.objetivoUrl} 
            onChange={e => setBrief({...brief, objetivoUrl: e.target.value})}
            placeholder="https://objetivo.com"
          />
        </div>
      </div>

      <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>País Objetivo</label>
            <select style={styles.select} value={brief.pais} onChange={e => setBrief({...brief, pais: e.target.value})}>
              {PAISES_LATAM.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Vertical</label>
            <select style={styles.select} value={brief.vertical} onChange={e => setBrief({...brief, vertical: e.target.value})}>
              {VERTICALES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <button 
          style={styles.btnPrimary} 
          onClick={handleSubmit} 
          disabled={loading || !brief.objetivoUrl}
          title={!brief.objetivoUrl ? "Ingresa una Empresa Objetivo para el Dossier Forense" : ""}
        >
          {loading ? "Generando..." : "Dossier Forense Único →"}
        </button>
        <button 
          style={{ ...styles.btnPrimary, background: "#3b82f6" }} 
          onClick={handleGeneratePortfolio} 
          disabled={loading}
        >
          {loading ? "Calculando..." : "Generar Portafolio de Prospectos (Hit List) 🔥"}
        </button>
      </div>

      <ContactCard />
    </div>
  );
}

const styles: any = {
  wrap: { maxWidth: 680, margin: "0 auto", padding: "2rem 1.5rem", fontFamily: "sans-serif" },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 8 },
  subtitle: { color: "#64748b", marginBottom: 24, fontSize: 14 },
  section: { marginBottom: "1.5rem" },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 },
  label: { fontSize: 13, color: "#475569", marginBottom: 4, display: "block" },
  input: { width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 8 },
  select: { width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 },
  divider: { borderTop: "1px solid #f1f5f9", margin: "1.5rem 0" },
  btnPrimary: { width: "100%", padding: "14px", borderRadius: 10, background: "#0f172a", color: "white", fontWeight: 600, border: "none", cursor: "pointer" },
  errorBox: { padding: "12px", background: "#fef2f2", color: "#991b1b", borderRadius: 8, marginBottom: 16, fontSize: 13 },
  loadingWrap: { textAlign: "center", padding: "100px" },
  resultWrap: { padding: "20px" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  resultTitle: { fontSize: 24, fontWeight: 700, margin: 0 },
  btnReset: { padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", cursor: "pointer" }
};
