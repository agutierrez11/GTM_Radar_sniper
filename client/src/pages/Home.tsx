import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Target, 
  BarChart3, 
  Database, 
  Globe, 
  Zap, 
  Cpu,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: '00:00', leads: 400 },
  { name: '04:00', leads: 1200 },
  { name: '08:00', leads: 900 },
  { name: '12:00', leads: 2400 },
  { name: '16:00', leads: 1800 },
  { name: '20:00', leads: 3200 },
  { name: '23:59', leads: 2800 },
];

export default function Home() {
  const [pulseScale, setPulseScale] = useState(1);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale(s => s === 1 ? 1.05 : 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Upper Status Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-900/30 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="bg-blue-600 w-3 h-8 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)]"></span>
            Centro de Mando GTM
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" /> 
            Motor SNIPER_FACTORY v20.0 • Operación Activa
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/companies">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold border-b-4 border-blue-800 active:border-b-0 transition-all">
              VER INTELIGENCIA
            </Button>
          </Link>
          <Button variant="outline" className="border-blue-900/50 text-slate-300 hover:bg-white/5">
            REPORTE ESTRATÉGICO
          </Button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Database, label: "Universo Total", value: "22,785", sub: "+432 hoy", color: "blue" },
          { icon: Zap, label: "Enriquecidos", value: "3,115", sub: "13.6% completado", color: "emerald" },
          { icon: Target, label: "Targets Diamond", value: "84", sub: "Alta Prioridad", color: "amber" },
          { icon: Globe, label: "Países Cubiertos", value: "14", sub: "LATAM Focus", color: "indigo" },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#0D1629] border-blue-900/30 shadow-xl overflow-hidden group hover:border-blue-500/50 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-bold text-white">{stat.value}</h2>
                  <span className="text-[10px] text-emerald-400 font-mono">{stat.sub}</span>
                </div>
              </div>
              <div className="mt-4 h-1 bg-slate-900 rounded-full overflow-hidden">
                <div className={`h-full bg-${stat.color}-500 w-[60%] opacity-50`}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Harvesting Chart */}
        <Card className="lg:col-span-2 bg-[#0D1629] border-blue-900/30 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-blue-900/20 bg-blue-950/20">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white text-lg">Velocidad de Caza (Real-time)</CardTitle>
                <CardDescription className="text-slate-500">Volumen de leads enriquecidos por el motor factory_worker</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A1428', border: '1px solid #1e3a8a', color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorLeads)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live Factory Telemetry */}
        <Card className="bg-[#050B18] border-blue-900/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Cpu className="h-20 w-20 text-blue-500 animate-[spin_10s_linear_infinite]" />
          </div>
          
          <CardHeader className="border-b border-blue-900/30">
            <CardTitle className="text-blue-400 text-sm font-mono tracking-tighter flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
              TELEMETRÍA_MOTOR
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 font-mono text-[10px] space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>ESTADO_NODO</span>
                <span className="text-emerald-400">OPTIMAL</span>
              </div>
              <Progress value={85} className="h-1 bg-blue-900/30 overflow-hidden">
                <div className="bg-blue-500 h-full w-[85%]"></div>
              </Progress>
            </div>

            <div className="space-y-3 pt-4">
              <p className="text-blue-500/70 border-l-2 border-blue-600 pl-2">
                [11:04:12] BUSCANDO_URL: Stori Card
              </p>
              <p className="text-blue-500/70 border-l-2 border-blue-600 pl-2">
                [11:04:15] URL_ENCONTRADA: stori.com.mx
              </p>
              <p className="text-emerald-500/70 border-l-2 border-emerald-600 pl-2">
                [11:04:22] FIRECRAWL_SUCCESS: Intel extraída (4.2kb)
              </p>
              <p className="text-blue-500/70 border-l-2 border-blue-600 pl-2">
                [11:04:28] ACTUALIZANDO_DB: Lead #34542 -> status: REFINERY
              </p>
              <p className="text-amber-500/70 border-l-2 border-amber-600 pl-2">
                [11:04:35] FALLBACK: Proxy Scrape.do activado para: Nu México
              </p>
            </div>

            <div className="pt-6">
              <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-lg flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-white font-bold text-xs">EFICIENCIA_PROCESO</p>
                  <p className="text-[18px] text-blue-400 font-bold">98.2%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Alerts */}
      <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex items-center gap-4">
        <div className="bg-amber-500/20 p-2 rounded-lg">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h4 className="text-amber-500 font-bold text-sm tracking-tight">ALERTA DE PRIORIDAD</h4>
          <p className="text-slate-400 text-[11px]">Se han detectado 3 nuevos targets de nivel DIAMOND en el segmento Fintech México. Requiere auditoría manual inmediata.</p>
        </div>
        <Button variant="link" className="text-amber-500 ml-auto text-xs underline decoration-amber-500/30">
          INVESTIGAR AHORA
        </Button>
      </div>
    </div>
  );
}
