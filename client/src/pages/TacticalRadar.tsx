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
    return (
      <Card className="bg-slate-950 border-slate-800 border rounded-xl p-6">
        <div className="flex items-center gap-3 text-slate-400">
           <Zap className="h-4 w-4" />
           <span className="text-sm font-medium">Re-denotación requerida para activar reporte premium.</span>
        </div>
      </Card>
    );
  }

  const cards = data.cards;

  const nextCard = () => setCurrentCard((prev) => (prev + 1) % cards.length);
  const prevCard = () => setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl overflow-hidden border flex flex-col min-h-[460px]">
        {/* Header - Clean & Minimal */}
        <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-indigo-600/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{data.target}</h3>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{data.competitor} vs Intelligence</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400 px-3">
            {data.date}
          </Badge>
        </div>

        <CardContent className="flex-1 flex flex-col p-0 relative">
          <div className="p-10 flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-6 flex items-center gap-3">
                   <div className="h-1 w-8 bg-indigo-500 rounded-full" />
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                      {cards[currentCard].type}
                   </span>
                </div>

                <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                  {cards[currentCard].title}
                </h2>
                
                <p className="text-xl text-slate-400 font-serif italic mb-8 leading-relaxed opacity-90">
                  "{cards[currentCard].quote}"
                </p>

                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 mb-8 backdrop-blur-sm">
                  <p className="text-base text-slate-300 leading-relaxed font-medium">
                    {cards[currentCard].description}
                  </p>
                </div>

                <div className="mt-auto space-y-2">
                  <span className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.1em] flex items-center gap-2">
                    <Activity className="h-3 w-3" /> Technical Evidence / Signal
                  </span>
                  <div className="text-sm text-indigo-300 font-mono font-medium py-2 px-4 bg-indigo-500/5 border border-indigo-500/10 rounded-lg inline-block">
                    {cards[currentCard].example}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Minimal Navigation */}
          <div className="px-8 py-6 border-t border-slate-800 bg-slate-900/80 flex justify-between items-center mt-auto">
             <div className="flex gap-2">
                {cards.map((_: any, i: number) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentCard(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentCard ? 'w-8 bg-indigo-500' : 'w-4 bg-slate-700 hover:bg-slate-600'}`} 
                  />
                ))}
             </div>
             <div className="flex gap-4">
                <Button 
                  onClick={prevCard}
                  variant="ghost" 
                  className="h-10 w-10 p-0 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <Map className="h-4 w-4 rotate-180" />
                </Button>
                <Button 
                   onClick={nextCard}
                   variant="ghost" 
                   className="h-10 w-10 p-0 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <Map className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
      {/* Decorative depth layers */}
      <div className="absolute -bottom-2 inset-x-4 h-4 bg-slate-900/40 border border-slate-800 rounded-2xl -z-10" />
      <div className="absolute -bottom-4 inset-x-8 h-4 bg-slate-900/20 border border-slate-800/50 rounded-2xl -z-20" />
    </motion.div>
  );
}

export default function TacticalRadar() {
  const { data: stats, isLoading: statsLoading } = trpc.insights.getDashboardStats.useQuery();
  const { data: trends, isLoading: trendsLoading } = trpc.insights.getTechTrends.useQuery();
  const { data: dossiers, isLoading: dossiersLoading } = (trpc.insights as any).getLatestDossiers.useQuery();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-12 text-slate-200 min-h-screen bg-slate-950 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        <header className="mb-14 flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
              NERV <span className="text-indigo-500">Estratega</span> Intelligence
            </h1>
            <p className="text-sm font-medium text-slate-500 tracking-wide">
              Global GTM Tactical Command Center
            </p>
          </div>
          <div className="text-right">
             <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold px-4 py-1.5 rounded-full">
                SYSTEMS_ONLINE
             </Badge>
          </div>
        </header>

        <div className="mb-16">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Estrategias de Penetración</h2>
                  <p className="text-xs text-slate-500 font-medium">Análisis quirúrgico de objetivos de alto valor</p>
               </div>
               <div className="h-[1px] flex-1 bg-slate-800 ml-10"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {dossiersLoading ? (
                 <div className="col-span-full h-64 flex flex-col items-center justify-center border border-slate-800 rounded-2xl bg-slate-900/50">
                    <Activity className="h-6 w-6 text-indigo-500 animate-spin mb-4" />
                    <span className="text-xs text-slate-500 font-medium tracking-widest uppercase">Generando inteligencia ejecutiva...</span>
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
                     <span className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">Sin estrategia de acercamientos activos en el cuadrante.</span>
                     <span className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest">MAPA DE DESTINO GLOBAL • LISTO PARA DETONACIÓN</span>
                  </div>
               )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Top Trends Chart */}
          <Card className="col-span-1 md:col-span-2 bg-slate-900/40 border-slate-800 border rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 pb-4">
              <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
                Predominancia Tecnológica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-8 px-4">
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
                      cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px' }}
                      itemStyle={{ color: '#6366f1', fontWeight: 'bold', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Schwerpunkt Opportunities (The Point of Main Effort) */}
          <Card className="bg-slate-900/40 border-slate-800 border rounded-2xl">
            <CardHeader className="border-b border-slate-800/50 pb-4">
              <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-indigo-500" />
                Puntos de Esfuerzo (Schwerpunkt)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {statsLoading ? (
                  <div className="text-xs text-slate-600 italic">Identificando señales críticas...</div>
                ) : (
                  (stats as any)?.schwerpunkt?.map((opp: any, i: number) => (
                    <div key={i} className="group p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase">{opp.name}</span>
                        <Badge variant="outline" className="text-[9px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold">
                          {opp.intensity}% FOCUS
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mb-3 leading-relaxed">{opp.pain_point}</p>
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-indigo-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{opp.action}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 transition-all hover:bg-slate-900/60">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vigilancia Total</h3>
              <p className="text-4xl font-bold text-white tracking-tighter">{stats?.total || 0}</p>
              <p className="text-[10px] text-indigo-500 font-bold mt-2 uppercase">Integridad de Datos Detectada</p>
           </div>

           <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 transition-all hover:bg-slate-900/60">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Alcance Regional</h3>
              <p className="text-4xl font-bold text-white tracking-tighter">6</p>
              <p className="text-[10px] text-emerald-500 font-bold mt-2 uppercase">Países en Operación</p>
           </div>

           <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 transition-all hover:bg-slate-900/60">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nodos de Refinería</h3>
              <p className="text-4xl font-bold text-white tracking-tighter">8</p>
              <p className="text-[10px] text-indigo-400 font-bold mt-2 uppercase">Threads en Paralelo v6.0</p>
           </div>

           <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 transition-all hover:bg-slate-900/60">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mente Maestra</h3>
              <p className="text-4xl font-bold text-white tracking-tighter">V3.0</p>
              <p className="text-[10px] text-amber-500 font-bold mt-2 uppercase">Inferencia Estratégica Activa</p>
           </div>
        </div>
      </div>
    </div>
  );
}
