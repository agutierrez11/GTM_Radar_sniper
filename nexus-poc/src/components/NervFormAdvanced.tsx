"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Markdown from "markdown-to-jsx";
import ContactCard from "./ContactCard";
import CommentsSection from "./CommentsSection";
import { MarketPulse } from "./MarketPulse";
import dynamic from "next/dynamic";

const NeuralMap = dynamic(() => import("./NeuralMap"), { ssr: false });

// ── Types ──────────────────────────────────────────────────────────────
interface StrategicIdentity {
  empresa: string;
  mision_gtm: string;
  ofertas_valor: Array<{ nombre: string; descripcion: string }>;
  icp_deducido: {
    industria: string;
    tamano: string;
    geografia: string;
    triggers: string[];
  };
}

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
  markdown: string;
  logId?: number;
  empresaId?: number;
  tech_summary?: { crm: string; pagos: string; kyc: string };
  signal_type?: string;
}

interface Prospect {
  empresa: string;
  url?: string;
  sector: string;
  dolor: string;
  gancho: string;
  score: number;
  tier: string;
  signal_type?: string;
  tech_summary?: { crm: string; pagos: string; kyc: string };
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
  { id: "Tier1", nombre: "Nivel 1 — Cuenta Estratégica", desc: "MEDDICII · Schwerpunkt", color: "#5E6AD2" },
  { id: "Tier2", nombre: "Nivel 2 — Precisión Técnica", desc: "Flanqueo · SPIN selling", color: "#3442AD" },
  { id: "Tier3", nombre: "Nivel 3 — Volumen Estratégico", desc: "Predictable Revenue", color: "#1A1A1E" },
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
  const [identity, setIdentity] = useState<StrategicIdentity | null>(null);
  
  const [step, setStep] = useState<"discovery" | "validation" | "loading" | "result" | "portfolio">("discovery");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [result, setResult] = useState<NervResult | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResult | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loadingSim, setLoadingSim] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string[]>(["Tier1", "Tier2"]);

  const handleDiscovery = async () => {
    if (!brief.vendedorUrl) {
      setError("Por favor, ingrese la URL de su organización.");
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
      if (!resp.ok) throw new Error("Fallo en el reconocimiento de identidad.");
      const data = await resp.json();
      setIdentity(data);
      setBrief(prev => ({
        ...prev,
        productosSeleccionados: data.ofertas_valor?.map((o: any) => o.nombre) || []
      }));
      setStep("validation");
    } catch (err) {
      setError("Detección Automática Interrumpida. Procediendo a Configuración Manual.");
      handleManualFallback();
    } finally {
      setScanning(false);
    }
  };

  const handleManualFallback = () => {
    setIdentity({
      empresa: "Nueva Organización",
      mision_gtm: "Defina aquí su misión estratégica...",
      ofertas_valor: [{ nombre: "Punto de Entrada 1", descripcion: "Breve descripción..." }],
      icp_deducido: { industria: "Fintech", tamano: "Scaleup", geografia: "Latam", triggers: ["Expansión"] }
    });
    setStep("validation");
  };

  const toggleProduct = (prod: string) => {
    setBrief((prev: GTMBriefAdvanced) => ({
      ...prev,
      productosSeleccionados: prev.productosSeleccionados.includes(prod)
        ? prev.productosSeleccionados.filter(p => p !== prod)
        : [...prev.productosSeleccionados, prod]
    }));
  };

  const handleFinalAnalysis = async () => {
    setLoading(true);
    setStep("loading");
    setLoadingMsg("Generando Análisis Forense de Cuentas Estratégicas...");

    try {
      const resp = await fetch("/api/prospect-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...brief, 
          empresaName: identity?.empresa,
          contexto_productos: identity?.ofertas_valor.filter(p => brief.productosSeleccionados.includes(p.nombre))
        }),
      });
      if (!resp.ok) throw new Error("Error en la prospección estratégica.");
      const data = await resp.json();
      setPortfolio(data);
      setStep("portfolio");
    } catch (err: any) {
      setError(err.message || "Error al generar el Portafolio de Oportunidades.");
      setStep("validation");
    } finally {
      setLoading(false);
    }
  };

  const handleSingleDossier = async (targetUrl: string) => {
    setLoading(true);
    setStep("loading");
    setLoadingMsg(`Realizando Diagnóstico de Precisión para Cuenta Estratégica...`);

    try {
      const resp = await fetch("/api/nexus-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...brief,
          objetivoUrl: targetUrl,
          empresaName: identity?.empresa,
          contexto_productos: identity?.ofertas_valor.filter(p => brief.productosSeleccionados.includes(p.nombre))
        }),
      });
      if (!resp.ok) throw new Error("Error en el diagnóstico de cuenta.");
      const data = await resp.json();
      setResult(data);
      setStep("result");
    } catch (err: any) {
      setError(err.message || "Error generando el Dossier Estratégico.");
      setStep("portfolio");
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

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <div className="w-12 h-12 border-4 border-[#5E6AD2] border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">{loadingMsg}</p>
      </div>
    );
  }

  if (step === "discovery") {
    return (
      <div className="relative w-full h-screen bg-white overflow-hidden flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
        {/* Capa de Mapa Neuronal 3D (Estético) */}
        <div className="absolute inset-0 z-0">
           <NeuralMap />
        </div>

        <div className="relative z-10 max-w-2xl w-full text-center">
            <div className="mb-12">
                <div className="inline-block px-3 py-1 bg-[#5E6AD2]/10 rounded-full mb-6">
                   <span className="text-[10px] font-black text-[#5E6AD2] uppercase tracking-[0.2em]">NERV GTM Intelligence v3.5 // Live Feed</span>
                </div>
                <h1 className="text-5xl font-black text-zinc-900 tracking-tight mb-4">
                  Identify <span className="text-[#5E6AD2]">Strategic Accounts</span>
                </h1>
                <p className="text-zinc-500 text-lg leading-relaxed max-w-lg mx-auto">
                  Análisis forense de mercado y detección de puntos de entrada en tiempo real.
                </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-zinc-200 shadow-2xl shadow-zinc-200/50">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">URL de su Organización</label>
                <div className="flex flex-col gap-4">
                    <input 
                        className="w-full px-6 py-4 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-[#5E6AD2] outline-none text-lg transition-all bg-white"
                        value={brief.vendedorUrl} 
                        onChange={e => setBrief({...brief, vendedorUrl: e.target.value})}
                        placeholder="https://su-empresa.com"
                        onKeyDown={(e) => e.key === 'Enter' && handleDiscovery()}
                    />
                    <button 
                        onClick={handleDiscovery}
                        disabled={scanning || !brief.vendedorUrl}
                        className="w-full bg-[#5E6AD2] hover:bg-[#4b55be] text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-[#5E6AD2]/20 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {scanning ? (
                           <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> ESCANEANDO IDENTIDAD...</>
                        ) : "Iniciar Inteligencia Estratégica →"}
                    </button>
                    {scanning && (
                      <button 
                        onClick={handleManualFallback}
                        className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-[#5E6AD2] transition-colors"
                      >
                        ¿Demora? Saltar a Configuración Manual
                      </button>
                    )}
                </div>
                {error && <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>}
            </div>
            
            <div className="mt-12 flex justify-center gap-8 opacity-40">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Precision Targeting</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">McKinsey Standard</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Zero Tension UX</div>
            </div>
        </div>
      </div>
    );
  }

  if (step === "validation" && identity) {
    return (
        <div className="max-w-3xl mx-auto py-12 px-6 animate-in slide-in-from-bottom-4 duration-700">
             <div className="mb-10 flex justify-between items-end">
                <div>
                   <span className="text-[10px] font-black text-[#5E6AD2] uppercase tracking-[0.2em]">Paso 02 // Validación</span>
                   <h1 className="text-3xl font-black text-zinc-900 mt-2">Identidad Estratégica Detectada</h1>
                </div>
                <button 
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-900 border-b border-zinc-200 pb-0.5"
                  onClick={() => setStep("discovery")}
                >
                  Cambiar URL
                </button>
             </div>

             <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-2xl">
                    <div className="mb-8">
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Organización</div>
                        <h2 className="text-2xl font-black text-zinc-900 leading-none">{identity.empresa}</h2>
                    </div>

                    <div className="mb-10">
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Misión de Mercado</div>
                        <p className="text-zinc-600 leading-relaxed text-lg italic">"{identity.mision_gtm}"</p>
                    </div>

                    <div className="mb-10">
                       <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Portafolio de Ofertas (Puntos de Entrada)</div>
                       <div className="grid grid-cols-1 gap-3">
                          {identity.ofertas_valor.map(o => (
                              <div 
                                key={o.nombre} 
                                onClick={() => toggleProduct(o.nombre)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer ${brief.productosSeleccionados.includes(o.nombre) ? 'bg-[#5E6AD2]/5 border-[#5E6AD2] ring-1 ring-[#5E6AD2]' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'}`}
                              >
                                  <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-zinc-900">{o.nombre}</span>
                                      {brief.productosSeleccionados.includes(o.nombre) && <div className="w-2 h-2 rounded-full bg-[#5E6AD2]" />}
                                  </div>
                                  <p className="text-xs text-zinc-500 leading-relaxed">{o.descripcion}</p>
                              </div>
                          ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-100">
                        <div>
                             <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Parámetros de Mercado</div>
                             <div className="space-y-4">
                                <select className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" value={brief.pais} onChange={e => setBrief({...brief, pais: e.target.value})}>
                                    {PAISES_LATAM.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <select className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm" value={brief.vertical} onChange={e => setBrief({...brief, vertical: e.target.value})}>
                                    {VERTICALES.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                             </div>
                        </div>

                        <div className="flex flex-col justify-end">
                            <button 
                                onClick={handleFinalAnalysis}
                                className="w-full bg-[#1A1A1E] text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                Confirmar y Prospectar Mercado →
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
  }

  if (step === "portfolio" && portfolio) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Portafolio de <span className="text-[#5E6AD2]">Oportunidades</span></h1>
          <button className="px-6 py-2 border border-zinc-200 rounded-full text-xs font-bold hover:bg-zinc-50" onClick={() => setStep("discovery")}>Nueva Búsqueda</button>
        </div>

        <div className="bg-[#1A1A1E] text-white p-10 rounded-[2.5rem] mb-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#5E6AD2] opacity-10 rounded-full -mr-32 -mt-32 blur-[100px]" />
           <div className="text-[10px] font-bold text-[#5E6AD2] uppercase mb-4 tracking-[0.3em]">Directiva Estratégica Macro</div>
           <div className="text-2xl font-light leading-relaxed max-w-4xl">{portfolio.estrategia_macro}</div>
        </div>

        <div className="flex gap-4 mb-8">
           {["Tier1", "Tier2", "Tier3"].map(t => (
             <button 
               key={t}
               onClick={() => {
                 setTierFilter(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
               }}
               className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${tierFilter.includes(t) ? 'bg-[#5E6AD2] border-[#5E6AD2] text-white' : 'bg-white border-zinc-200 text-zinc-400'}`}
             >
               {t} {tierFilter.includes(t) ? '✓' : ''}
             </button>
           ))}
        </div>

        <div className="overflow-hidden border border-zinc-100 rounded-[2rem] bg-white shadow-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="text-left py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cuenta Estratégica</th>
                <th className="text-left py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dolor Crítico</th>
                <th className="text-left py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Punto de Entrada</th>
                <th className="text-center py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fit (%)</th>
                <th className="text-center py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.portfolio
                .filter(p => tierFilter.length === 0 || tierFilter.includes(p.tier))
                .map((p, idx) => (
                <tr key={idx} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/70 transition-colors">
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-3">
                      <div className="font-black text-zinc-900">{p.empresa}</div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black text-white ${p.tier === 'Tier1' ? 'bg-[#5E6AD2]' : p.tier === 'Tier2' ? 'bg-[#3442AD]' : 'bg-zinc-400'}`}>
                        {p.tier}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#5E6AD2] font-black uppercase mt-1 tracking-wider">{p.sector}</div>
                  </td>
                  <td className="py-6 px-8 text-sm text-zinc-600 italic leading-relaxed">
                    <div className="mb-1 text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{p.signal_type || 'Discovery Signal'}</div>
                    "{p.dolor}"
                  </td>
                  <td className="py-6 px-8">
                     <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-[#3442AD] bg-[#F0F1FF] px-4 py-2 rounded-full inline-block text-center">
                           {p.gancho}
                        </span>
                        {p.tech_summary?.crm && p.tech_summary.crm !== 'No detectado' && (
                          <div className="text-[8px] text-center font-bold text-zinc-400 uppercase tracking-tighter">
                             Focus: Enriquecimiento de {p.tech_summary.crm}
                          </div>
                        )}
                     </div>
                  </td>
                  <td className="py-6 px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-[#1A1A1E] text-white text-[10px] font-black rounded-full">
                      {p.score}%
                    </span>
                  </td>
                  <td className="py-6 px-8 text-center">
                    <button 
                      onClick={() => handleSingleDossier(p.url || "")}
                      className="bg-[#5E6AD2] text-white text-[10px] px-6 py-3 rounded-xl font-black uppercase tracking-wider hover:bg-[#4b55be] transition-all shadow-lg shadow-[#5E6AD2]/20"
                    >
                      Dossier
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
      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{result.empresa} <span className="text-[#5E6AD2]">Forensic Dossier</span></h1>
          <button className="px-6 py-2 border border-zinc-200 rounded-full text-xs font-bold hover:bg-zinc-50" onClick={() => setStep("portfolio")}>Volver al Portafolio</button>
        </div>

        {/* New Stats Layers */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-10">
           <div className={`p-6 rounded-[2rem] border ${result.tier === 'Tier1' ? 'bg-[#F0F1FF] border-[#D9DCFF]' : 'bg-zinc-50 border-zinc-100'}`}>
              <div className="text-[10px] font-black text-[#5E6AD2] uppercase mb-1 tracking-widest">Account Priority</div>
              <div className="text-3xl font-black text-zinc-900">{result.tier}</div>
              <div className="text-[10px] text-[#5E6AD2] font-bold mt-1 uppercase">Strategic Ranking</div>
           </div>
           <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-[2rem]">
              <div className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Alineación Score</div>
              <div className="text-3xl font-black text-zinc-900">{result.icp_score || 94}%</div>
              <div className="text-[10px] text-zinc-400 font-bold mt-1 uppercase">Surgical Fit Detected</div>
           </div>
           <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-[2rem]">
              <div className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Tech Inventory</div>
              <div className="text-xs font-bold text-zinc-900 mt-2">
                 {result.tech_summary?.crm !== 'No detectado' ? `CRM: ${result.tech_summary?.crm}` : 'CRM: Blind Analysis'}
              </div>
              <div className="text-[9px] text-[#5E6AD2] font-black mt-2 uppercase tracking-tighter">
                 {result.tech_summary?.crm !== 'No detectado' ? `Target: Enriquecer ${result.tech_summary?.crm}` : 'Opportunity: Discovery'}
              </div>
           </div>
           <div className="bg-zinc-900 border border-[#1A1A1E] p-6 rounded-[2rem]">
              <div className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Signal Type</div>
              <div className="text-lg font-black text-white uppercase leading-none mt-2">{result.signal_type || 'Active'}</div>
              <div className="text-[10px] text-zinc-400 font-bold mt-2 uppercase italic">Growth Context</div>
           </div>
        </div>
        
        <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-100 shadow-2xl prose prose-zinc max-w-none">
          <Markdown
            options={{
              overrides: {
                h1: { props: { className: "text-2xl font-black mt-8 mb-6 text-zinc-900 border-b border-zinc-100 pb-4 tracking-tight" } },
                h2: { props: { className: "text-xl font-black mt-10 mb-4 text-zinc-900 flex items-center gap-2 before:content-[''] before:w-1 before:h-6 before:bg-[#5E6AD2] before:rounded-full" } },
                h3: { props: { className: "text-lg font-bold mt-6 mb-3 text-zinc-800" } },
                p: { props: { className: "mb-6 text-zinc-600 leading-relaxed text-lg" } },
                ul: { props: { className: "list-disc pl-8 mb-6 space-y-3" } },
                li: { props: { className: "text-zinc-600 text-lg" } },
                strong: { props: { className: "font-black text-zinc-900" } },
                blockquote: { props: { className: "border-l-4 border-[#5E6AD2] pl-8 py-4 italic bg-[#F0F1FF] rounded-r-3xl my-8 text-zinc-700 text-lg" } },
              }
            }}
          >
            {result.markdown}
          </Markdown>
        </div>

        {/* OASIS SIMULATION CARD (MiroFish Protocol) */}
        {!simulation ? (
          <div className="mt-16 p-12 bg-[#1A1A1E] rounded-[3rem] border border-white/5 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#5E6AD2] to-transparent opacity-50" />
            <h3 className="text-white text-2xl font-black mb-3 tracking-tight">OASIS Simulation Engine</h3>
            <p className="text-zinc-500 text-md mb-10 max-w-lg mx-auto leading-relaxed">
              Predicción de reacción para Cuentas Estratégicas bajo el protocolo MiroFish.
            </p>
            <button 
              onClick={runSimulation}
              disabled={loadingSim}
              className="bg-[#5E6AD2] hover:bg-[#4b55be] text-white px-16 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-[0_20px_50px_rgba(94,106,210,0.3)] disabled:opacity-50"
            >
              {loadingSim ? "Simulando ENCUENTRO..." : "Ejecutar Escenario de Predicción 🔥"}
            </button>
          </div>
        ) : (
          <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="bg-white rounded-[3.5rem] border border-zinc-100 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.08)]">
              <div className="bg-[#1A1A1E] px-12 py-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#5E6AD2] animate-pulse" />
                  <span className="text-white font-black text-[10px] uppercase tracking-widest">MiroFish v1.1 Simulation Engine</span>
                </div>
                <div className="text-right">
                    <div className="text-[9px] text-zinc-500 font-black uppercase leading-none mb-1">Success Score</div>
                    <div className="text-[#5E6AD2] font-black text-2xl leading-none">{simulation.card_report.success_score}%</div>
                </div>
              </div>

              <div className="p-16">
                <div className="mb-16">
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight mb-4">
                    {simulation.escenario}
                  </h2>
                  <div className="w-16 h-1.5 bg-[#5E6AD2] rounded-full" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16">
                   <div className="space-y-12 relative">
                      <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-zinc-100" />
                      {simulation.simulacion.map((step, idx) => (
                        <div key={idx} className="relative pl-14 group">
                          <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-white border-2 border-zinc-100 flex items-center justify-center z-10 group-hover:border-[#5E6AD2] transition-colors">
                             <div className="w-2 h-2 rounded-full bg-zinc-200 group-hover:bg-[#5E6AD2] transition-colors" />
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Minuto {step.minuto}</span>
                             <div className="h-px flex-1 bg-zinc-100" />
                             <span className="text-[11px] font-black text-[#5E6AD2] uppercase leading-none">{step.probabilidad_exito}% Confianza</span>
                          </div>
                          <h4 className="text-zinc-900 font-black text-xl mb-3 tracking-tight">{step.accion}</h4>
                          <p className="text-zinc-500 text-lg leading-relaxed">{step.reaccion_prospecto}</p>
                        </div>
                      ))}
                   </div>

                   <div className="space-y-8">
                      <div className="bg-zinc-50 p-10 rounded-[2.5rem] border border-zinc-100">
                         <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 block">Estrategia de Acercamiento</span>
                         <p className="text-zinc-600 text-lg leading-relaxed italic">
                           "{simulation.card_report.narrative_spread}"
                         </p>
                      </div>
                      <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100">
                         <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4 block">Riesgo Crítico Detectado</span>
                         <p className="text-red-700/60 text-md leading-relaxed italic">
                           {simulation.card_report.critical_risk}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="mt-20 pt-10 border-t border-zinc-100">
                   <div className="flex items-center justify-between mb-8">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Protocolo de Seguimiento MiroFish</span>
                      <div className="h-px flex-1 mx-8 bg-zinc-100" />
                   </div>
                   <div className="bg-zinc-50 p-12 rounded-3xl border border-zinc-200 font-medium text-zinc-700 text-lg italic leading-relaxed relative group cursor-pointer hover:border-[#5E6AD2]/50 transition-all">
                      <div className="absolute top-4 right-8 text-[9px] text-zinc-400 font-black group-hover:text-[#5E6AD2]">CLICK PARA COPIAR FLUJO</div>
                      "{simulation.follow_up}"
                   </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => setSimulation(null)}
                className="text-[10px] text-zinc-400 font-black uppercase tracking-widest hover:text-[#5E6AD2] transition-all py-3 px-8 border border-zinc-200 rounded-full hover:border-[#5E6AD2]"
              >
                ← Reiniciar Motor de Predicción
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-20 border-t border-zinc-100 pt-20" />
        <MarketPulse empresaId={result.empresaId || 0} empresaNombre={result.empresa} />
      </div>
    );
  }

  return null; // Should never reach here due to steps
}
