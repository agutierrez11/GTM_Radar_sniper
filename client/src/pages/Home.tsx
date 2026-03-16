import { useState, useEffect } from 'react';
import { Search, Bell, LayoutDashboard, Target, Zap, Activity, Globe, Shield, User, ChevronRight, Filter } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '@/lib/supabaseClient';

/**
 * NERV Portal v22.0 - Premium Fintech Edition
 * Inspiration: Atiqur Rahman (Dribbble)
 * Focus: Clean, surgical, 4-input power syntax.
 */

export default function Home() {
  const [isRadarRunning, setIsRadarRunning] = useState(false);
  const [formData, setFormData] = useState({
    rol: '',
    vertical: '',
    region: '',
    angulo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRadarRunning(true);
    toast.message("Nexus Power Syntax Activado", {
      description: `Detonando ataque para ${formData.vertical} en ${formData.region}`,
    });
    
    // Simulate GTM Logic
    setTimeout(() => {
      setIsRadarRunning(false);
      toast.success("Misión Sincronizada", {
        description: "Coordenadas enviadas al Command Center.",
      });
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-[#111827] font-sans overflow-hidden">
      {/* Sidebar Pro */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">NERV Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Mando Central" active />
          <NavItem icon={<Target size={18}/>} label="Objetivos Sniper" />
          <NavItem icon={<Zap size={18}/>} label="Explorador Nexus" />
          <NavItem icon={<Globe size={18}/>} label="Mapa Conceptual" />
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="bg-indigo-50 p-4 rounded-xl">
            <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Status Sistema</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Motor v21.0 Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar Pro */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-96">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Buscar inteligencia estratégica..." className="bg-transparent text-sm w-full outline-none" />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-gray-600">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold">A. Gutierrez</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Master Architect</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                AG
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-auto p-8 bg-[#F9FAFB]">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Mission Hero Section */}
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Bienvenido Comandante</h1>
                <p className="text-gray-500 mt-1">Configura tu vector de ataque táctico para hoy.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl border-gray-200 bg-white shadow-sm font-bold">
                  <Filter size={16} className="mr-2" /> Filtros Avanzados
                </Button>
                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md font-bold px-6">
                  Nueva Misión
                </Button>
              </div>
            </div>

            {/* Nexus Power Syntax - EL CORE */}
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Zap className="text-indigo-600" size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 tracking-tight">Sintaxis de Poder Nexus</h2>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <InputSelect 
                    label="Tu Rol" 
                    value={formData.rol} 
                    onChange={v => setFormData({...formData, rol: v})}
                    options={["Adquirente Local", "Orquestador", "MoR (Merchant of Record)", "PSP Agregador", "BaaS Provider"]}
                  />
                  <InputSelect 
                    label="Vertical Target" 
                    value={formData.vertical} 
                    onChange={v => setFormData({...formData, vertical: v})}
                    options={["Payments & Remittances", "Lending", "Tech Infrastructure", "Crypto & Blockchain", "iGaming / Digital Goods"]}
                  />
                  <InputSelect 
                    label="Región / Vector" 
                    value={formData.region} 
                    onChange={v => setFormData({...formData, region: v})}
                    options={["México", "Brasil", "Colombia", "Chile", "Perú", "Global (Cross-border)"]}
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Ángulo de Ataque</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ej: Payouts A2A"
                        value={formData.angulo}
                        onChange={(e) => setFormData({...formData, angulo: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        required
                      />
                      <Button 
                        type="submit" 
                        disabled={isRadarRunning}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg font-bold px-6"
                      >
                        {isRadarRunning ? <Activity className="h-4 w-4 animate-spin" /> : "DETONAR"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Metrics Quick Look */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <QuickStat label="Sniper Score" value="8.4" color="blue" />
              <QuickStat label="Oportunidades" value="124" color="emerald" />
              <QuickStat label="Uptime Radar" value="99.9%" color="indigo" />
              <QuickStat label="Leads Purgados" value="5.8k" color="amber" />
            </div>

            {/* Recent Leads Preview */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold tracking-tight">Inteligencia Reciente</h3>
                  <button className="text-sm font-bold text-indigo-600 flex items-center hover:underline">
                    Ver todo <ChevronRight size={14} />
                  </button>
               </div>
               <div className="space-y-4">
                  <LeadRow company="Stripe LATAM" sector="Infrastructure" tier="Diamond" score={98} />
                  <LeadRow company="Nubank Brazil" sector="Digital Banking" tier="Gold" score={92} />
                  <LeadRow company="Clip Mexico" sector="Acquiring" tier="Diamond" score={95} />
                  <LeadRow company="Kushki" sector="Orchestration" tier="Gold" score={89} />
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components for cleaner structure
function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
      {icon}
      <span className="text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
    </div>
  );
}

function InputSelect({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: string[] }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
        required
      >
        <option value="" disabled>Seleccionar...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function QuickStat({ label, value, color }: { label: string, value: string, color: 'blue' | 'emerald'| 'indigo' | 'amber' }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <div className={`p-6 rounded-3xl border ${colors[color]} flex flex-col gap-1 shadow-sm`}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-2xl font-black">{value}</span>
    </div>
  );
}

function LeadRow({ company, sector, tier, score }: { company: string, sector: string, tier: string, score: number }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100 group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
          {company.substring(0, 2)}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 leading-none">{company}</h4>
          <p className="text-xs text-gray-500 mt-1">{sector} • {tier}</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="text-sm font-black text-gray-900">{score}%</p>
          <p className="text-[10px] font-bold text-emerald-600 uppercase">Match</p>
        </div>
        <Button variant="ghost" size="sm" className="rounded-lg hover:bg-white border border-transparent hover:border-gray-200 shadow-none">
          Analizar
        </Button>
      </div>
    </div>
  );
}
