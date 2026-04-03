import { useEffect, useState } from 'react';
import { fetchLiveLeads } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import MetricCard from '@/components/MetricCard';
import LeadsTable from '@/components/LeadsTable';
import GraphView from '@/components/GraphView/GraphView';
import BattleCards from '@/components/BattleCards/BattleCards';
import { TrendingUp, Target, Zap, LayoutList, Network, Swords, Shield, Activity } from 'lucide-react';
import { toast } from "sonner";

export interface Lead {
  id: string;
  company: string;
  contact?: string;
  country: string;
  tier: 'diamond' | 'gold' | 'silver';
  status: 'active' | 'pending' | 'high-potential';
  score: number;
  signal: string;
  opportunity: string;
}

type ViewMode = 'table' | 'graph' | 'battle-cards';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Power Syntax State (4 Input Fields)
  const [formData, setFormData] = useState({
    rol: '',
    vertical: '',
    region: '',
    angulo: ''
  });

  useEffect(() => {
    // No auto-load on mount for POC purity
    setLoading(false);
  }, []);

  const handleRowClick = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setViewMode('graph');
  };

  const handleAnalyze = async () => {
    if (!formData.rol || !formData.vertical || !formData.region || !formData.angulo) {
      toast.error("Parámetros incompletos", { description: "Configura los 4 campos de poder." });
      return;
    }
    
    setLoading(true);
    toast.message("Sincronizando Radar", {
       description: `Analizando ${formData.vertical} para ${formData.rol} en ${formData.region}`,
       icon: <Activity className="animate-spin text-blue-600" />
    });

    const rawLeads = await fetchLiveLeads();
    const mapped = rawLeads.map((l: any) => {
      let displaySignal = 'Señal estratégica detectada';
      if (l.description) {
         try {
           const parsed = typeof l.description === 'string' ? JSON.parse(l.description) : l.description;
           displaySignal = parsed.signal || parsed.description || parsed.reason || l.description.substring(0, 60);
         } catch (e) {
           displaySignal = l.description.substring(0, 60);
         }
      }

      return {
        id: l.id.toString(),
        company: l.name,
        country: l.sector || 'Global',
        tier: l.infra_potential ? 'diamond' as const : 'gold' as const,
        status: 'active' as const,
        score: l.infra_potential ? 95 : 75,
        signal: displaySignal,
        opportunity: l.opportunity || 'GTM Growth'
      };
    });
    
    setLeads(mapped);
    if (mapped.length > 0) setSelectedLeadId(mapped[0].id);
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-white text-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-auto bg-gray-50/20">
          <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">

            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">
                  Radar de Inteligencia GTM
                </h1>
                <p className="text-slate-500 text-sm">
                  Explora señales estratégicas y oportunidades de mercado en tiempo real.
                </p>
              </div>

              {/* Toggle Vista */}
              <div
                style={{
                  display: 'flex',
                  background: '#f3f4f6',
                  borderRadius: '10px',
                  padding: '3px',
                  gap: '2px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    transition: 'all 0.15s ease',
                    background: viewMode === 'table' ? '#ffffff' : 'transparent',
                    color: viewMode === 'table' ? '#111827' : '#6b7280',
                    boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <LayoutList size={15} />
                  Tabla
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    transition: 'all 0.15s ease',
                    background: viewMode === 'graph' ? '#ffffff' : 'transparent',
                    color: viewMode === 'graph' ? '#378ADD' : '#6b7280',
                    boxShadow: viewMode === 'graph' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <Network size={15} />
                  Mapa Conceptual
                </button>
                <button
                  onClick={() => setViewMode('battle-cards')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    transition: 'all 0.15s ease',
                    background: viewMode === 'battle-cards' ? '#ffffff' : 'transparent',
                    color: viewMode === 'battle-cards' ? '#ef4444' : '#6b7280',
                    boxShadow: viewMode === 'battle-cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <Swords size={15} />
                  Battle Cards
                </button>
              </div>
            </div>


            {/* LOS 4 CAMPOS TÁCTICOS - INTEGRACIÓN QUIRÚRGICA */}
            <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Estrategia de Acercamiento Quirúrgico Nexus</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tu Rol</label>
                  <select 
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="">Seleccionar Rol...</option>
                    <option>Adquirente Local</option>
                    <option>Orquestador</option>
                    <option>PSP Agregador</option>
                    <option>Merchant of Record</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vertical Target</label>
                  <select 
                    value={formData.vertical}
                    onChange={(e) => setFormData({...formData, vertical: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="">Seleccionar Segmento...</option>
                    <option>Fintech & Pagos</option>
                    <option>SaaS B2B</option>
                    <option>iGaming</option>
                    <option>Retail / E-commerce</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Región / Vector</label>
                  <select 
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="">Seleccionar Región...</option>
                    <option>México</option>
                    <option>Brasil</option>
                    <option>Colombia</option>
                    <option>Chile</option>
                  </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ángulo de Estrategia de Acercamiento</label>
                   <div className="flex gap-2">
                     <input 
                       type="text"
                       placeholder="Ej: Payouts A2A"
                       value={formData.angulo}
                       onChange={(e) => setFormData({...formData, angulo: e.target.value})}
                       className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
                     />
                     <button 
                       onClick={handleAnalyze}
                       className="px-6 py-2 bg-[#378ADD] text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-all shadow-sm active:scale-95"
                     >
                       DETONAR
                     </button>
                   </div>
                </div>
              </div>
            </div>

            {/* Vista principal: Tabla o Grafo */}
            {viewMode === 'table' ? (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-foreground">
                    Leads <span className="text-muted-foreground font-normal">({leads.length})</span>
                  </h2>
                </div>
                <LeadsTable leads={leads} onRowClick={handleRowClick} />
              </div>
            ) : viewMode === 'battle-cards' ? (
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-base font-semibold text-foreground">Battle Cards</h2>
                </div>
                <BattleCards leadId={selectedLeadId} />
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-base font-semibold text-foreground">Mapa Conceptual</h2>
                </div>
                <div style={{ flex: 1, minHeight: '480px' }}>
                  <GraphView leadId={selectedLeadId} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
