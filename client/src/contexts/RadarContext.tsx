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
    toast.message("Radar Detonated", {
      description: `Iniciando caza táctica para: ${url1}`,
    });

    try {
      // 1. Insert/Update the primary target
      const { error: error1 } = await supabase.from(TABLE_LEADS).insert([
        { 
          name: url1.replace(/https?:\/\/(www\.)?/, '').split('.')[0].toUpperCase(), 
          website: url1, 
          status: 'CASCARON_PENDIENTE',
          description: 'RADAR_HUNT_INITIATED'
        }
      ]);

      if (error1) {
        // If duplicate, try to update status to re-trigger
        await supabase.from(TABLE_LEADS).update({ status: 'CASCARON_PENDIENTE' }).eq('website', url1);
      }

      // 2. If secondary URL exists, insert it too
      if (url2) {
        const { error: error2 } = await supabase.from(TABLE_LEADS).insert([
          { 
            name: url2.replace(/https?:\/\/(www\.)?/, '').split('.')[0].toUpperCase(), 
            website: url2, 
            status: 'CASCARON_PENDIENTE',
            description: 'RADAR_COMPETITOR_HUNT'
          }
        ]);
        if (error2) {
          await supabase.from(TABLE_LEADS).update({ status: 'CASCARON_PENDIENTE' }).eq('website', url2);
        }
      }

      // Simulate some processing delay for UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Misión Asignada", {
        description: "El Sniper Engine ha recibido las coordenadas. Intel real en camino.",
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
