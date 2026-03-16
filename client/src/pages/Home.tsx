import { useEffect, useState } from 'react';
import { fetchLiveLeads } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import MetricCard from '@/components/MetricCard';
import LeadsTable from '@/components/LeadsTable';
import GraphView from '@/components/GraphView/GraphView';
import BattleCards from '@/components/BattleCards/BattleCards';
import { TrendingUp, Target, Zap, LayoutList, Network, Swords, Activity, ShieldAlert } from 'lucide-react';
import { useRadar } from '@/contexts/RadarContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const { runNexusHunt, isRadarRunning } = useRadar();
  const [formData, setFormData] = useState({
    rol: '',
    vertical: '',
    region: '',
    angulo: ''
  });

  useEffect(() => {
    async function load() {
      const rawLeads = await fetchLiveLeads();
      const mapped = rawLeads.map((l: any) => ({
        id: l.id.toString(),
        company: l.name,
        contact: 'Analizado por NERV',
        country: l.sector || 'Global',
        tier: l.infra_potential ? 'diamond' as const : 'gold' as const,
        status: 'active' as const,
        score: l.infra_potential ? 95 : 75,
        signal: l.description ? l.description.substring(0, 50) + '...' : 'Señal estratégica detectada',
        opportunity: 'Surgical Strike GTM'
      }));
      setLeads(mapped);
      if (mapped.length > 0) setSelectedLeadId(mapped[0].id);
      setLoading(false);
    }
    load();
  }, []);

  const handleRowClick = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setViewMode('graph');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runNexusHunt(formData.rol, formData.vertical, formData.region, formData.angulo);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-auto bg-gray-50/30">
          <div className="p-8 max-w-7xl mx-auto h-full flex flex-col gap-8">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  Mando Central NERV
                </h1>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                   <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                   Motor Sniper v20.2 • Nexus Architect 2026
                </p>
              </div>

              {/* Toggle Vista */}
              <div className="flex bg-gray-100 rounded-lg p-1 gap-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LayoutList size={15} /> Tabla
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'graph' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Network size={15} /> Mapa Conceptual
                </button>
                <button
                  onClick={() => setViewMode('battle-cards')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'battle-cards' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Swords size={15} /> Battle Cards
                </button>
              </div>
            </div>

            {/* Nexus Power Syntax Form */}
            <Card className="bg-[#0D1629] border-blue-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-emerald-600/5 opacity-50"></div>
              <CardHeader className="relative z-10 pb-2">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  Sintaxis de Poder Nexus
                </CardTitle>
                <CardDescription className="text-gray-400">Define tu vector de ataque estratégico (Finnovista 2026).</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Tu Rol</label>
                    <select 
                      value={formData.rol}
                      onChange={(e) => setFormData({...formData, rol: e.target.value})}
                      className="w-full bg-black/40 border border-blue-900/50 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                      required
                    >
                      <option value="" disabled>Selecciona Rol...</option>
                      <option value="Adquirente Local">Adquirente Local</option>
                      <option value="Orquestador de Pagos">Orquestador de Pagos</option>
                      <option value="MoR (Merchant of Record)">MoR (Merchant of Record)</option>
                      <option value="PSP Agregador">PSP Agregador</option>
                      <option value="BaaS Provider">BaaS Provider</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Vertical Target</label>
                    <select 
                      value={formData.vertical}
                      onChange={(e) => setFormData({...formData, vertical: e.target.value})}
                      className="w-full bg-black/40 border border-blue-900/50 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                      required
                    >
                      <option value="" disabled>Selecciona Vertical...</option>
                      <option value="Payments_&_Remittances">Payments & Remittances</option>
                      <option value="Lending">Lending</option>
                      <option value="Tech_Infrastructure">Tech Infrastructure</option>
                      <option value="Crypto_&_Blockchain">Crypto & Blockchain</option>
                      <option value="Digital_Banking">Digital Banking</option>
                      <option value="iGaming / Digital Goods">iGaming / Digital Goods</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Región / Vector</label>
                    <select 
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      className="w-full bg-black/40 border border-blue-900/50 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                      required
                    >
                      <option value="" disabled>Selecciona Región...</option>
                      <option value="México">México</option>
                      <option value="Brasil">Brasil</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Chile">Chile</option>
                      <option value="Perú">Perú</option>
                      <option value="Cross-border Global">Cross-border Global</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ángulo de Ataque</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ej: Payouts A2A"
                        value={formData.angulo}
                        onChange={(e) => setFormData({...formData, angulo: e.target.value})}
                        className="w-full bg-black/40 border border-blue-900/50 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                        required
                      />
                      <Button 
                        type="submit" 
                        disabled={isRadarRunning}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
                      >
                        {isRadarRunning ? <Activity className="h-4 w-4 animate-spin" /> : "DETONAR"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="GTM Sniper Score" value="8.4" subtitle="Basado en 156 leads" icon={<Target className="w-5 h-5" />} trend={{ value: 12, direction: 'up' }} accentColor="blue" />
              <MetricCard title="Surgical Opps" value="24" subtitle="Listas para detonar" icon={<Zap className="w-5 h-5" />} trend={{ value: 8, direction: 'up' }} accentColor="orange" />
              <MetricCard title="Speed Score" value="98%" subtitle="Eficiencia de señales" icon={<TrendingUp className="w-5 h-5" />} accentColor="green" />
              <MetricCard title="Universo Total" value="22,785" subtitle="+432 hoy" icon={<Network className="w-5 h-5" />} accentColor="purple" />
            </div>

            {/* Main Content View */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <Activity className="h-8 w-8 animate-spin mb-4" />
                  <p>Inyectando Inteligencia...</p>
                </div>
              ) : viewMode === 'table' ? (
                <LeadsTable leads={leads} onRowClick={handleRowClick} />
              ) : viewMode === 'graph' ? (
                <GraphView leadId={selectedLeadId} />
              ) : (
                <BattleCards leadId={selectedLeadId} />
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
