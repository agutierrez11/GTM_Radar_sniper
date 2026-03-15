import React, { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Target, 
  Map, 
  Zap, 
  Activity, 
  Globe, 
  PieChart, 
  BarChart3,
  Layers,
  Search,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { motion, AnimatePresence } from 'framer-motion';

function BattleCardDeck({ dossier }: { dossier: any }) {
  const [currentCard, setCurrentCard] = React.useState(0);
  let data;
  try {
    data = JSON.parse(dossier.description);
    if (!data.cards) throw new Error("Format V1 detected");
  } catch (e) {
    // Fallback for old dossiers
    return (
      <Card className="bg-[#050B18] border-red-900/30 border rounded-2xl p-4">
        <span className="text-xs text-red-500 font-mono italic">
          [!] INFO_LEGACY: Este dossier requiere re-detonación para activar el Mazo de Batalla.
        </span>
      </Card>
    );
  }

  const cards = data.cards;

  const nextCard = () => setCurrentCard((prev) => (prev + 1) % cards.length);
  const prevCard = () => setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
      
      <Card className="relative bg-[#051125] border-white/10 shadow-2xl rounded-2xl overflow-hidden border-2 min-h-[400px] flex flex-col">
        {/* Upper HUD */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest">
              NERV // STRATEGIC_DECK // {data.target}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">{data.date}</span>
        </div>

        <CardContent className="flex-1 flex flex-col p-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold px-3 py-1 text-[10px] uppercase tracking-tighter">
                  {cards[currentCard].type}
                </Badge>
                <span className="text-[10px] font-mono text-slate-600 font-black tracking-widest">
                   {cards[currentCard].id}
                </span>
              </div>

              <h2 className="text-3xl font-black text-white mb-2 tracking-tight leading-none uppercase">
                {cards[currentCard].title}
              </h2>
              
              <p className="text-lg text-slate-400 font-medium italic mb-8 border-l-4 border-blue-500/30 pl-4 py-1 leading-tight">
                "{cards[currentCard].quote}"
              </p>

              <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-6">
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {cards[currentCard].description}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="text-[10px] uppercase text-slate-500 font-black tracking-widest block mb-1">Ejemplo Táctico</span>
                <span className="text-sm text-blue-400 font-mono font-bold">{cards[currentCard].example}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-8 flex justify-between items-center bg-black/40 -mx-8 -mb-8 px-8 py-4 border-t border-white/5">
             <div className="flex gap-2">
                {cards.map((_: any, i: number) => (
                  <div 
                    key={i} 
                    className={`h-1 w-6 rounded-full transition-all duration-500 ${i === currentCard ? 'bg-blue-500' : 'bg-white/10'}`} 
                  />
                ))}
             </div>
             <div className="flex gap-3">
                <Button 
                  onClick={prevCard}
                  variant="outline" 
                  className="h-8 w-8 p-0 rounded-full border-white/10 bg-white/5 hover:bg-blue-500/20 text-white"
                >
                  <Map className="h-3 w-3 rotate-180" />
                </Button>
                <Button 
                   onClick={nextCard}
                   variant="outline" 
                   className="h-8 w-8 p-0 rounded-full border-white/10 bg-white/5 hover:bg-blue-500/20 text-white"
                >
                  <Map className="h-3 w-3" />
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function TacticalRadar() {
  const { data: stats, isLoading: statsLoading } = trpc.insights.getDashboardStats.useQuery();
  const { data: trends, isLoading: trendsLoading } = trpc.insights.getTechTrends.useQuery();
  const { data: dossiers, isLoading: dossiersLoading } = (trpc.insights as any).getLatestDossiers.useQuery();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-8 pt-10 text-slate-100 min-h-screen bg-[#0A1428]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-end border-b border-white/[0.05] pb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">Operaciones Especiales: Inteligencia de Campo</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Project_NERV: Command Center</h1>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">GTM Intel Core • Operativo</span>
          </div>
        </header>

        {/* PRIMARY SECTION: Surgical Dossiers (The Magic) */}
        <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-sm font-bold text-blue-400 uppercase tracking-[0.5em] flex items-center gap-3">
                  <Zap className="h-5 w-5 fill-current animate-pulse" /> Dossiers de Inteligencia Estratégica
               </h2>
               <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/30 to-transparent ml-8"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {dossiersLoading ? (
                 <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-blue-900/30 rounded-3xl bg-blue-900/5 backdrop-blur-sm">
                    <Activity className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                    <span className="text-sm text-blue-400 animate-pulse font-mono tracking-widest">EXTRAYENDO MÁGIA ESTRATÉGICA...</span>
                 </div>
               ) : (
                 <AnimatePresence>
                   {dossiers?.map((d: any, i: number) => (
                     <BattleCardDeck key={i} dossier={d} />
                   ))}
                 </AnimatePresence>
               )}
               {!dossiersLoading && (!dossiers || dossiers.length === 0) && (
                  <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl group hover:border-blue-500/30 transition-colors">
                     <span className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">Sin ataques activos en el cuadrante.</span>
                     <span className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest">MAPA DE DESTINO GLOBAL • LISTO PARA DETONACIÓN</span>
                  </div>
               )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Top Trends Chart */}
          <Card className="col-span-1 md:col-span-2 bg-white/[0.02] border-white/5 border rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                Tecnologías Dominantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends || []}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => val.toUpperCase().slice(0, 10)}
                    />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Schwerpunkt Opportunities (The Point of Main Effort) */}
          <Card className="bg-white/[0.02] border-blue-500/20 border rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.1)]">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-blue-400 uppercase tracking-[0.1em] flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500 animate-pulse" />
                Schwerpunkt: Puntos de Ataque Decisivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statsLoading ? (
                  <div className="text-xs text-slate-500 italic">Analizando enjambre...</div>
                ) : (
                  (stats as any)?.schwerpunkt?.map((opp: any, i: number) => (
                    <div key={i} className="group cursor-pointer p-3 rounded-xl bg-blue-600/5 border border-blue-500/10 hover:border-blue-500/40 transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-white group-hover:text-blue-400">{opp.name}</span>
                        <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/30">
                          {opp.intensity}% INTENSIDAD
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mb-2">{opp.pain_point}</p>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-500 uppercase">{opp.action}</span>
                      </div>
                    </div>
                  ))
                )}
                {!statsLoading && (!stats as any)?.schwerpunkt?.length === 0 && (
                  <div className="text-xs text-slate-500 border border-dashed border-slate-800 p-4 rounded-xl text-center">
                    Buscando intersecciones de señales...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-blue-600/5 border border-blue-500/20 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Target className="h-24 w-24 text-blue-400" />
              </div>
              <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Carga Operativa</h3>
              <p className="text-3xl font-bold text-white">{stats?.total || 0}</p>
              <p className="text-[10px] text-slate-500 mt-2">LEADS TOTALES BAJO VIGILANCIA</p>
           </div>

           <div className="bg-emerald-600/5 border border-emerald-500/20 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Globe className="h-24 w-24 text-emerald-400" />
              </div>
              <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Cobertura LATAM</h3>
              <p className="text-3xl font-bold text-white">6</p>
              <p className="text-[10px] text-slate-500 mt-2">PAÍSES ACTIVOS EN EL RADAR</p>
           </div>

           <div className="bg-amber-600/5 border border-amber-500/20 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Layers className="h-24 w-24 text-amber-400" />
              </div>
              <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Nodos de Refinería</h3>
              <p className="text-3xl font-bold text-white">8</p>
              <p className="text-[10px] text-slate-500 mt-2">CORES EN PARALELO OPTIMIZADOS</p>
           </div>

           <div className="bg-purple-600/5 border border-purple-500/20 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Zap className="h-24 w-24 text-purple-400" />
              </div>
              <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Lead Scorer ML</h3>
              <p className="text-3xl font-bold text-white">V2.5</p>
              <p className="text-[10px] text-slate-500 mt-2">MODELO DE PRIORIZACIÓN ACTIVO</p>
           </div>
        </div>
      </div>
    </div>
  );
}
