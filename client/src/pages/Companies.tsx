import React, { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Globe,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  Crosshair,
  Flame,
  Gem,
  Network,
  ChevronRight,
  Lock,
  Users,
  Layers
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  country: string;
  segment: string;
  tier: string;
  status: string;
  description: string;
  painPoints: string[];
  solutions: string[];
  killShot: string;
  stakeholders: Array<{
    role: string;
    name: string;
    motivation: string;
  }>;
}

// Battle Card Component
function BattleCard({ company, onClose }: { company: Company; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-cyan-500/30 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 flex items-center gap-2 text-xl font-bold">
            <Crosshair className="h-5 w-5" />
            Battle Card: {company.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-mono text-xs">
            ESTRATEGIA DE ATAQUE Y EJECUCIÓN TÁCTICA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4">Perfil del Objetivo</h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-tighter">Ubicación</p>
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-slate-400" />
                  <p className="text-white font-medium">{company.country}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-tighter">Segmento</p>
                <p className="text-white font-medium">{company.segment?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-tighter">Clasificación</p>
                <Badge className={cn("text-[10px] font-bold px-2 py-0", {
                  'bg-blue-600': company.tier === 'diamond',
                  'bg-amber-600': company.tier === 'gold',
                  'bg-slate-600': company.tier === 'silver',
                })}>{company.tier?.toUpperCase()}</Badge>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-tighter">Status</p>
                <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-400 px-2 py-0 uppercase">{company.status}</Badge>
              </div>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5">
            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              Pain Points (La Herida)
            </h3>
            <div className="space-y-2">
              {company.painPoints?.map((pain, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-red-500 mt-1">▸</span>
                  <span className="text-slate-300 font-medium">{pain}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5">
            <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Flame className="h-3 w-3" />
              The Kill-Shot (Ejecución)
            </h3>
            <p className="text-slate-200 font-mono text-sm leading-relaxed border-l-2 border-emerald-500/30 pl-4 py-1">
              {company.killShot}
            </p>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users className="h-3 w-3" />
              Stakeholders (Interesados)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {company.stakeholders?.map((sh, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3 flex justify-between items-center group">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{sh.role}</p>
                    <p className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{sh.name}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] border-white/10 text-slate-400">{sh.motivation}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-lg shadow-blue-900/20">
              <Zap className="h-4 w-4 mr-2" />
              EJECUTAR CAMPAÑA
            </Button>
            <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-slate-300 font-bold h-11">
              DESCARGAR DOSSIER
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Pipeline Phase component
function PipelinePhase({ phase, icon: Icon, companies, color }: { phase: string; icon: React.ReactNode; companies: Company[]; color: string; }) {
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg bg-opacity-10", {
            'bg-emerald-500': color === 'emerald',
            'bg-amber-500': color === 'amber',
            'bg-cyan-500': color === 'cyan',
          })}>
            {Icon}
          </div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{phase === 'Hunting' ? 'CACERÍA' : phase.toUpperCase()}</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-white/[0.05] px-2 py-0.5 rounded-full">{companies?.length || 0}</span>
      </div>

      <div className="space-y-3">
        {companies?.map((company) => (
          <div
            key={company.id}
            className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 hover:bg-white/[0.04] hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden shadow-sm"
          >
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", {
              'bg-blue-500': company.tier === 'diamond',
              'bg-amber-500': company.tier === 'gold',
              'bg-slate-500': company.tier === 'silver',
              'bg-emerald-500': company.tier === 'emerging',
            })} />

            <div className="flex justify-between items-start mb-2">
              <p className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                {company.name}
              </p>
              <Badge variant="outline" className="text-[9px] border-white/5 text-slate-500 h-4 px-1">
                {company.country}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
              {company.description || 'Inteligencia esperando proceso de refinería...'}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {company.painPoints?.slice(0, 2).map((p, i) => (
                   <span key={i} className="text-[8px] text-blue-400/70 border border-blue-500/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">{p}</span>
                ))}
              </div>
              <ChevronRight className="h-3 w-3 text-slate-700 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        ))}
        {(!companies || companies.length === 0) && (
          <div className="border border-dashed border-white/5 rounded-xl p-8 text-center bg-white/[0.01]">
            <p className="text-xs text-slate-700 font-mono italic uppercase tracking-tighter">sector_sin_explorar_orbita</p>
          </div>
        )}
      </div>
    </div>
  );
}

// GraphNode component
function GraphNode({ company, isSelected, onClick }: { company: Company; isSelected: boolean; onClick: () => void; }) {
  const tierColors = {
    diamond: 'from-blue-600 to-cyan-500 border-blue-400 shadow-blue-900/40',
    gold: 'from-amber-600 to-orange-500 border-amber-400 shadow-amber-900/40',
    silver: 'from-slate-500 to-slate-400 border-slate-400 shadow-slate-900/40',
    emerging: 'from-emerald-600 to-green-500 border-emerald-400 shadow-green-900/40'
  };

  return (
    <button
      onClick={onClick}
      className={cn("relative group transition-all duration-500", isSelected ? 'scale-125 z-20' : 'hover:scale-110')}
    >
      <div className={cn("absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity bg-gradient-to-r",
        tierColors[company.tier as keyof typeof tierColors]?.split(' ')[0] || 'from-slate-500')}
      />
      <div className={cn("relative w-14 h-14 rounded-full bg-gradient-to-br flex flex-col items-center justify-center border shadow-xl",
        tierColors[company.tier as keyof typeof tierColors] || 'from-slate-500 to-slate-400 border-slate-400')}>
        <p className="text-[10px] font-bold text-white tracking-widest leading-none">{company.name.slice(0, 3).toUpperCase()}</p>
        <span className="text-[8px] text-white/70 font-bold uppercase mt-0.5 tracking-tighter">{company.tier?.[0] || 'S'}</span>
      </div>
    </button>
  );
}

const LATAM_COUNTRIES = [
  { code: 'MX', name: 'México' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CO', name: 'Colombia' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Perú' },
];

const FINTECH_SEGMENTS = ['pagos', 'lending', 'insurtech', 'wallets', 'neobanks', 'blockchain'];

export default function Companies() {
  const { data: rawLeads, isLoading: loading } = trpc.companies.list.useQuery({ limit: 1000 });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState('pipeline');

  const leads = useMemo(() => {
    if (!rawLeads) return [];
    return rawLeads.map((r: any) => {
      let extra: any = {};
      try { if (r.description?.startsWith('{')) extra = JSON.parse(r.description); } catch(e) {}
      
      return {
        id: r.id.toString(),
        name: r.name || 'Desconocido',
        country: r.country || 'MX',
        segment: r.segment || extra.segment || 'saas',
        tier: (() => {
          const t = (r.tier || extra.tier || '').toLowerCase();
          if (t.includes('diamante') || t === 'diamond') return 'diamond';
          if (t.includes('oro') || t === 'gold') return 'gold';
          if (t.includes('plata') || t === 'silver') return 'silver';
          if (t.includes('emerging')) return 'emerging';
          return 'silver';
        })(),
        status: r.status?.toLowerCase() || 'objetivo',
        description: r.description || '',
        painPoints: r.pain_points || extra.pain_points || [],
        solutions: r.solutions || extra.solutions || [],
        killShot: r.kill_shot || extra.kill_shot || r.description,
        stakeholders: r.stakeholders || extra.stakeholders || []
      } as Company;
    });
  }, [rawLeads]);

  const filtered = useMemo(() => {
    return leads.filter(c => {
      const ms = searchQuery === '' || c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const mc = selectedCountry === 'all' || c.country === selectedCountry;
      const mseg = selectedSegment === 'all' || c.segment === selectedSegment;
      const mt = selectedTier === 'all' || c.tier === selectedTier;
      return ms && mc && mseg && mt;
    });
  }, [leads, searchQuery, selectedCountry, selectedSegment, selectedTier]);

  const hunting = useMemo(() => filtered.filter(c => c.tier === 'silver' || c.tier === 'emerging'), [filtered]);
  const refinery = useMemo(() => filtered.filter(c => c.tier === 'gold'), [filtered]);
  const liquidation = useMemo(() => filtered.filter(c => c.tier === 'diamond'), [filtered]);

  return (
    <div className="p-8 pt-10 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-end border-b border-white/[0.05] pb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">Operación Táctica</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Project_NERV: Base de Inteligencia</h1>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Nodo de Control Global • {leads.length} Objetivos Activos</span>
            <div className="flex gap-2">
               <Badge variant="outline" className="text-[9px] border-blue-500/20 text-blue-500 bg-blue-500/5">MOTOR_FIRECRAWL_V2</Badge>
               <Badge variant="outline" className="text-[9px] border-green-500/20 text-green-500 bg-green-500/5">SUPABASE_TIEMPO_REAL</Badge>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Objetivos', value: filtered.length, color: 'blue' },
            { label: 'Modo Hunting', value: hunting.length, color: 'emerald' },
            { label: 'Procesamiento Refinería', value: refinery.length, color: 'amber' },
            { label: 'Liquidación Final', value: liquidation.length, color: 'cyan' },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 hover:bg-white/[0.04] transition-all group">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">{s.label}</p>
              <p className={cn("text-3xl font-bold tracking-tight", {
                'text-blue-500': s.color === 'blue',
                'text-emerald-500': s.color === 'emerald',
                'text-amber-500': s.color === 'amber',
                'text-cyan-500': s.color === 'cyan',
              })}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 mb-12">
           <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              <Filter className="h-4 w-4 text-blue-500" />
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filtros Operativos</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="relative col-span-1 md:col-span-1 lg:col-span-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                <Input
                  placeholder="Nombre del Objetivo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-white/5 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 rounded-lg h-9 text-xs"
                />
              </div>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-slate-900/50 border-white/5 text-slate-200 h-9 text-xs">
                  <SelectValue placeholder="Territorio" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1428] border-white/10 text-slate-200">
                  <SelectItem value="all">Todos los Territorios</SelectItem>
                  {LATAM_COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger className="bg-slate-900/50 border-white/5 text-slate-200 h-9 text-xs">
                  <SelectValue placeholder="Segmento de Mercado" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1428] border-white/10 text-slate-200">
                  <SelectItem value="all">Todos los Segmentos</SelectItem>
                  {FINTECH_SEGMENTS.map(s => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="bg-slate-900/50 border-white/5 text-slate-200 h-9 text-xs">
                  <SelectValue placeholder="Clasificación" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A1428] border-white/10 text-slate-200">
                  <SelectItem value="all">Todos los Tiers</SelectItem>
                  <SelectItem value="diamond">DIAMANTE</SelectItem>
                  <SelectItem value="gold">ORO</SelectItem>
                  <SelectItem value="silver">PLATA</SelectItem>
                  <SelectItem value="emerging">EMERGENTE</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                onClick={() => {setSearchQuery(''); setSelectedCountry('all'); setSelectedSegment('all'); setSelectedTier('all');}}
                className="text-[10px] font-bold text-slate-500 hover:text-white uppercase"
              >
                Resetear Cuadrícula
              </Button>
           </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white/[0.02] border border-white/5 p-1 rounded-xl">
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-blue-600 text-[10px] font-bold px-6 uppercase tracking-widest text-slate-400 data-[state=active]:text-white transition-all transform data-[state=active]:scale-105 rounded-lg active:scale-95">
              Refinería
            </TabsTrigger>
            <TabsTrigger value="graph" className="data-[state=active]:bg-blue-600 text-[10px] font-bold px-6 uppercase tracking-widest text-slate-400 data-[state=active]:text-white transition-all transform data-[state=active]:scale-105 rounded-lg active:scale-95">
              Mapa_Intel
            </TabsTrigger>
            <TabsTrigger value="table" className="data-[state=active]:bg-blue-600 text-[10px] font-bold px-6 uppercase tracking-widest text-slate-400 data-[state=active]:text-white transition-all transform data-[state=active]:scale-105 rounded-lg active:scale-95">
              Cuadrícula_Táctica
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <div className="flex gap-8 items-start overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-white/10">
              <PipelinePhase phase="Hunting" icon={<Target className="h-4 w-4 text-emerald-500" />} companies={hunting} color="emerald" />
              <div className="flex items-center pt-8 text-white/5 mt-4"><ChevronRight className="h-4 w-4" /></div>
              <PipelinePhase phase="Refinería" icon={<Gem className="h-4 w-4 text-amber-500" />} companies={refinery} color="amber" />
              <div className="flex items-center pt-8 text-white/5 mt-4"><ChevronRight className="h-4 w-4" /></div>
              <PipelinePhase phase="Liquidación" icon={<Flame className="h-4 w-4 text-cyan-500" />} companies={liquidation} color="cyan" />
            </div>
          </TabsContent>

          <TabsContent value="graph">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 min-h-[600px] flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
               <div className="flex flex-wrap gap-8 justify-center items-center max-w-5xl z-10">
                 {filtered.slice(0, 50).map(c => (
                   <GraphNode key={c.id} company={c} isSelected={selectedCompany?.id === c.id} onClick={() => setSelectedCompany(c)} />
                 ))}
                 {filtered.length === 0 && (
                   <div className="text-center">
                     <Network className="h-10 w-10 text-white/5 mx-auto mb-4" />
                     <p className="text-xs text-slate-600 uppercase tracking-widest font-mono">Sin_Firmas_Detectadas</p>
                   </div>
                 )}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="table">
            <div className="bg-[#0A1428]/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/5">
                    <th className="py-5 px-6 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Objetivo</th>
                    <th className="py-5 px-6 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Territorio</th>
                    <th className="py-5 px-6 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Estado_Intel</th>
                    <th className="py-5 px-6 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-all group cursor-default">
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{c.name}</span>
                           <span className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">{c.description || 'Esperando escaneo profundo...'}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-sm text-slate-100 font-mono"><span className="text-slate-500">LATAM/</span>{c.country}</td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                           <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px]", {
                             'bg-blue-500 shadow-blue-500/50': c.tier === 'diamond',
                             'bg-amber-500 shadow-amber-500/50': c.tier === 'gold',
                             'bg-slate-500 shadow-slate-500/50': c.tier === 'silver',
                           })} />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{c.tier}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[10px] font-bold text-blue-500 hover:text-white hover:bg-blue-600 rounded-md transition-all uppercase px-3"
                          onClick={() => setSelectedCompany(c)}
                        >
                          Ver_Intel
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedCompany && <BattleCard company={selectedCompany} onClose={() => setSelectedCompany(null)} />}
    </div>
  );
}
