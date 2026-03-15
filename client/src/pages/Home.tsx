import { useEffect, useState } from 'react';
import { fetchLiveLeads } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import MetricCard from '@/components/MetricCard';
import LeadsTable from '@/components/LeadsTable';
import GraphView from '@/components/GraphView/GraphView';
import BattleCards from '@/components/BattleCards/BattleCards';
import { TrendingUp, Target, Zap, LayoutList, Network, Swords } from 'lucide-react';

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

// Leads will be populated from Supabase

type ViewMode = 'table' | 'graph' | 'battle-cards';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-auto bg-gray-50/30">
          <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">

            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-1">
                  Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">
                  Inteligencia GTM en tiempo real para tu equipo de ventas
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

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="GTM Sniper Score"
            value="8.4"
            subtitle="Basado en 156 leads activos"
            icon={<Target className="w-5 h-5" />}
            trend={{ value: 12, direction: 'up' }}
            accentColor="blue"
          />
          <MetricCard
            title="Surgical Opportunities"
            value="24"
            subtitle="Listas para detonar"
            icon={<Zap className="w-5 h-5" />}
            trend={{ value: 8, direction: 'up' }}
            accentColor="orange"
          />
          <MetricCard
            title="Speed Score"
            value="98%"
            subtitle="Eficiencia en captura de señales"
            icon={<TrendingUp className="w-5 h-5" />}
            accentColor="green"
          />
          <MetricCard
            title="Latencia de Respuesta"
            value="1.2s"
            subtitle="Tiempo de inferencia"
            icon={<Network className="w-5 h-5" />}
            accentColor="purple"
          />
        </div>

        {/* Live Signal Feed Section */}
        <div className="mb-8 p-4 bg-blue-50/20 border border-blue-100 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider">Surgical Signal Feed (Live)</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            <div className="flex-shrink-0 bg-white p-2 rounded border border-blue-100 text-[10px] space-y-1 w-48 shadow-sm">
              <p className="font-bold text-blue-800">MEXICO: REGULATORY</p>
              <p className="text-gray-600 truncate">Actualización SEGOB: Juego online...</p>
              <p className="text-[8px] text-gray-400">Hace 2 min</p>
            </div>
            <div className="flex-shrink-0 bg-white p-2 rounded border border-blue-100 text-[10px] space-y-1 w-48 shadow-sm">
              <p className="font-bold text-blue-800">LATAM: EXPANSION</p>
              <p className="text-gray-600 truncate">VTEX anuncia hub en Colombia</p>
              <p className="text-[8px] text-gray-400">Hace 5 min</p>
            </div>
            <div className="flex-shrink-0 bg-white p-2 rounded border border-blue-100 text-[10px] space-y-1 w-48 shadow-sm">
              <p className="font-bold text-blue-800">SaaS: FUNDING</p>
              <p className="text-gray-600 truncate">Fracttal levanta $10M Serie B</p>
              <p className="text-[8px] text-gray-400">Hace 12 min</p>
            </div>
          </div>
        </div>
            {/* Filtros */}
            <div className="mb-6 flex gap-3 flex-wrap items-center">
              <select className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
                <option>Todas las regiones</option>
                <option>México</option>
                <option>Brasil</option>
                <option>Colombia</option>
                <option>Argentina</option>
              </select>
              <select className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
                <option>Todos los segmentos</option>
                <option>SaaS (B2B/B2C)</option>
                <option>Fintech & Pagos</option>
                <option>Proptech</option>
                <option>Healthtech</option>
              </select>
              <select className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
                <option>Todos los tiers</option>
                <option>Diamond</option>
                <option>Gold</option>
                <option>Silver</option>
              </select>
              <button className="px-6 py-2 bg-[#378ADD] text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
                Analizar
              </button>
            </div>

            {/* Vista principal: Tabla o Grafo */}
            {viewMode === 'table' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-foreground">
                    Leads <span className="text-muted-foreground font-normal">({leads.length})</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Haz clic en un lead para ver su mapa conceptual o battle cards
                  </p>
                </div>
                <LeadsTable leads={leads} onRowClick={handleRowClick} />
              </div>
            ) : viewMode === 'battle-cards' ? (
              <div>
                {/* Lead selector en vista battle cards */}
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-base font-semibold text-foreground">
                    Battle Cards
                  </h2>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {leads.map((lead) => {
                      const isActive = selectedLeadId === lead.id;
                      return (
                        <button
                          key={lead.id}
                          onClick={() => setSelectedLeadId(lead.id)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: `1px solid ${isActive ? '#ef4444' : '#e5e7eb'}`,
                            background: isActive ? '#fef2f2' : '#ffffff',
                            color: isActive ? '#ef4444' : '#6b7280',
                            fontSize: '12px',
                            fontWeight: isActive ? 500 : 400,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          {lead.company}
                          {lead.tier === 'diamond' && (
                            <span style={{ fontSize: '9px', color: '#7c3aed' }}>◆</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <BattleCards leadId={selectedLeadId} />
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                {/* Lead selector en vista grafo */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-base font-semibold text-foreground">
                    Mapa Conceptual
                  </h2>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {leads.map((lead) => {
                      const isActive = selectedLeadId === lead.id;
                      return (
                        <button
                          key={lead.id}
                          onClick={() => setSelectedLeadId(lead.id)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: `1px solid ${isActive ? '#378ADD' : '#e5e7eb'}`,
                            background: isActive ? '#eff6ff' : '#ffffff',
                            color: isActive ? '#378ADD' : '#6b7280',
                            fontSize: '12px',
                            fontWeight: isActive ? 500 : 400,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          {lead.company}
                          {/* Indicador tier */}
                          {lead.tier === 'diamond' && (
                            <span style={{ fontSize: '9px', color: '#7c3aed' }}>◆</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setViewMode('table')}
                    style={{
                      marginLeft: 'auto',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#6b7280',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    <LayoutList size={13} />
                    Ver tabla
                  </button>
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
