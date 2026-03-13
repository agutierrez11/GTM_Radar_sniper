import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Target, 
  Database, 
  Gem, 
  Shield, 
  LayoutDashboard,
  Zap,
  ChevronLeft,
  ChevronRight,
  Globe,
  Settings,
  Search
} from "lucide-react";
import { Link, useLocation } from "wouter";

import { useRadar } from '@/contexts/RadarContext';

export function Sidebar() {
  const { runRadar, isRadarRunning } = useRadar();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');

  const menuItems = [
    { icon: LayoutDashboard, label: 'Panel Control', path: '/' },
    { icon: Database, label: 'Inteligencia', path: '/companies' },
    { icon: Gem, label: 'Refinería', path: '/refinery' },
    { icon: Shield, label: 'Bóveda GTM', path: '/vault' },
  ];

  const handleRunRadar = async () => {
    if (!url1) return;
    await runRadar(url1, url2);
    setUrl1('');
    setUrl2('');
  };

  return (
    <div className={cn(
      "h-screen bg-[#0A1428] border-r border-blue-900/30 flex flex-col transition-all duration-300 relative z-50",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 w-6 h-6 bg-blue-600 rounded-full border border-blue-400 flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          <Target className="text-white h-6 w-6" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-widest text-lg">NERV</span>
            <span className="text-[10px] text-blue-400 font-mono tracking-tighter">SNIPER_FACTORY v20.0</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all group",
              location === item.path 
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}>
              <item.icon className={cn(
                "h-5 w-5 transition-transform",
                location === item.path ? "scale-110" : "group-hover:scale-110"
              )} />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </div>
          </Link>
        ))}
      </nav>

      {/* Radar Comparison Tool */}
      {!collapsed && (
        <div className="px-6 py-8 border-t border-blue-900/30 bg-blue-950/20">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-blue-400" /> {/* Icon changed */}
            <h3 className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Radar de Ataque</h3> {/* Translated */}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 uppercase font-bold ml-1">URL Objetivo Primario</label> {/* Translated */}
              <Input 
                value={url1}
                onChange={(e) => setUrl1(e.target.value)}
                placeholder="https://empresa-a.com" // Translated placeholder
                className="bg-[#050B18] border-blue-900/50 text-slate-200 h-9 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 uppercase font-bold ml-1">URL Objetivo Secundario (Opcional)</label> {/* Translated */}
              <Input 
                value={url2}
                onChange={(e) => setUrl2(e.target.value)}
                placeholder="https://competidor.com" // Translated placeholder
                className="bg-[#050B18] border-blue-900/50 text-slate-200 h-9 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
              />
            </div>

            <Button 
              onClick={handleRunRadar} // Changed to use handleRunRadar
              disabled={!url1 || isRadarRunning}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 border-b-4 border-blue-800 active:border-b-0 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              <Zap className={cn("h-4 w-4", isRadarRunning && "animate-pulse")} />
              {isRadarRunning ? "ESCANEANDO..." : "DETONAR RADAR"} {/* Translated */}
            </Button>
            
            <p className="text-[8px] text-center text-slate-600 font-mono">FIRECRAWL_ENGINE_V2.5 • ACTIVO</p> {/* Translated */}
          </div>
        </div>
      )}

      {/* Footer Settings */}
      <div className="p-6 border-t border-blue-900/30">
        <div className={cn(
          "flex items-center gap-3 text-slate-500 hover:text-white cursor-pointer transition-colors",
          collapsed ? "justify-center" : ""
        )}>
          <Settings className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Control Center</span>}
        </div>
      </div>
    </div>
  );
}
