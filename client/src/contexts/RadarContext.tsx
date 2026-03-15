import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase, TABLE_LEADS } from '@/lib/supabase';
import { toast } from "sonner";

interface RadarContextType {
  isRadarRunning: boolean;
  runRadar: (url1: string, url2: string) => Promise<void>;
}

const RadarContext = createContext<RadarContextType | undefined>(undefined);

export function RadarProvider({ children }: { children: React.ReactNode }) {
  const [isRadarRunning, setIsRadarRunning] = useState(false);

  const runRadar = useCallback(async (url1: string, url2: string) => {
    if (!url1) return;
    
    setIsRadarRunning(true);
    toast.message("Radar Detonado", {
      description: `Iniciando ataque quirúrgico para: ${url1}`,
    });

    try {
      // Call the high-priority surgical strike mutation
      // This triggers the Python code that does deep research and saves the dossier
      const { trpc } = await import('@/lib/trpc');
      // We need to use the trpc client directly here as we are in a callback
      // For the demo, we'll use a fetch-based approach or just rely on the effect
      // Actually, since this is a context, we can't easily use the hook.
      // We'll use a simple fetch to the endpoint or update via the TRPC util.
      
      const response = await fetch('/api/trpc/scoring.detonateSurgicalRadar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url1, competitorUrl: url2 })
      });

      if (!response.ok) throw new Error("FALLO_TRPC_BRIDGE");

      // Simulate some processing delay for UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Misión Asignada", {
        description: "El Comando Central ha recibido las coordenadas. Generando Dossier de Inteligencia...",
      });

    } catch (err) {
      console.error("Radar Fail:", err);
      toast.error("Radar Error", {
        description: "No se pudo comunicar con el Command Center.",
      });
    } finally {
      setIsRadarRunning(false);
    }
  }, []);

  // Real-time listener for lead updates
  React.useEffect(() => {
    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: TABLE_LEADS },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status === 'ENRIQUECIDO') {
            toast.success(`Objetivo Identificado: ${updated.name}`, {
              description: "Inteligencia profunda disponible en la refinería.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <RadarContext.Provider value={{ isRadarRunning, runRadar }}>
      {children}
    </RadarContext.Provider>
  );
}

export function useRadar() {
  const context = useContext(RadarContext);
  if (context === undefined) {
    throw new Error('useRadar must be used within a RadarProvider');
  }
  return context;
}
