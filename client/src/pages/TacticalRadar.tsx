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

function StrategicDossierCard({ dossier }: { dossier: any }) {
  let data;
  try {
    data = JSON.parse(dossier.description);
  } catch (e) {
    return (
      <Card className="bg-[#050B18] border-red-900/30 border rounded-2xl p-4">
        <span className="text-xs text-red-500 font-mono">ERR_RECO_DATA: El formato de inteligencia no es pulcro.</span>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="bg-[#051125] border-blue-500/20 shadow-2xl rounded-2xl overflow-hidden group border-2 hover:border-blue-500/60 transition-all duration-500">
        <CardHeader className="bg-gradient-to-r from-blue-600/20 to-indigo-600/5 p-6 border-b border-blue-500/10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <Zap className="h-3 w-3 text-yellow-400 fill-current" />
                 <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ataque Quirúrgico Detonado</span>
              </div>
              <CardTitle className="text-xl font-bold text-white tracking-tight leading-none">{data.target}</CardTitle>
            </div>
            <div className="text-right">
               <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-bold">{data.date}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="p-6 space-y-6">
            {/* Schwerpunkt Section */}
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Target className="h-3 w-3" /> {data.schwerpunkt.title}
               </h3>
               <p className="text-sm text-slate-300 font-medium leading-relaxed italic border-l-2 border-blue-500/40 pl-4 py-1 bg-blue-500/5 rounded-r">
                  "{data.schwerpunkt.description}"
               </p>
               <ul className="flex flex-wrap gap-2 pt-1">
                  {data.schwerpunkt.signals.map((s: string, idx: number) => (
                    <li key={idx} className="text-[9px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded uppercase border border-slate-700">
                       • {s}
                    </li>
                  ))}
               </ul>
            </div>

            {/* Flanking Maneuvers Table */}
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Análisis de Flanqueo</h3>
               <div className="rounded-xl border border-white/5 overflow-hidden bg-black/20">
                  <table className="w-full text-left text-[10px]">
                     <thead className="bg-white/[0.03] text-slate-500 font-bold uppercase">
                        <tr>
                           <th className="px-3 py-2">Vector</th>
                           <th className="px-3 py-2">Falla Competidor</th>
                           <th className="px-3 py-2 text-blue-400">Victoria Sumsub</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/[0.05]">
                        {data.flanking_maneuvers.map((m: any, idx: number) => (
                          <tr key={idx} className="hover:bg-blue-500/5 transition-colors">
                             <td className="px-3 py-2 font-bold text-slate-300">{m.vector}</td>
                             <td className="px-3 py-2 text-slate-400">{m.comp_fail}</td>
                             <td className="px-3 py-2 font-bold text-blue-400">{m.victory}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Kill Shot Strategy */}
            <div className="space-y-3">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estrategia Kill Shot (30-60-90)</h3>
               <div className="grid grid-cols-1 gap-2">
                  {data.kill_shot.map((step: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                       <span className="text-xs font-bold text-blue-500 mt-0.5">{idx + 1}.</span>
                       <div className="text-[10px]">
                          <span className="block font-bold text-slate-200 mb-0.5">{step.phase}</span>
                          <span className="text-slate-400">{step.action}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="bg-blue-600/10 p-4 flex justify-between items-center border-t border-blue-500/10">
             <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Verificación Técnica OK</span>
             </div>
             <Button variant="outline" className="h-8 text-[10px] font-bold border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105">
                GENERAR PDF EJECUTIVO
             </Button>
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
                     <StrategicDossierCard key={i} dossier={d} />
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
