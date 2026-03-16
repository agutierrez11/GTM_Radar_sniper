import React, { createContext, useContext, useState, useCallback } from 'react';
const SUPABASE_URL = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE_LEADS = 'empresas';
import { toast } from "sonner";

interface RadarContextType {
  isRadarRunning: boolean;
  runRadar: (url1: string, url2: string, context?: any) => Promise<void>;
  runNexusHunt: (rol: string, vertical: string, region: string, angulo: string) => Promise<void>;
}

const RadarContext = createContext<RadarContextType | undefined>(undefined);

export function RadarProvider({ children }: { children: React.ReactNode }) {
  const [isRadarRunning, setIsRadarRunning] = useState(false);

  const runNexusHunt = useCallback(async (rol: string, vertical: string, region: string, angulo: string) => {
    setIsRadarRunning(true);
    toast.message("Iniciando Misión Nexus", {
      description: `Buscando ${vertical} en ${region} con el rol de ${rol}`,
    });

    try {
      // For PoC: We create a "Mission Context" as a special lead or update 50 existing leads
      // Here we store the mission parameters in a way the backend can read
      const missionPayload = {
        name: `MISIÓN_${vertical.toUpperCase()}_${region.toUpperCase()}`,
        website: `mission://nexus_poc_50`,
        status: 'PENDIENTE',
        description: JSON.stringify({
          type: 'nexus_mission',
          rol,
          vertical,
          region,
          angulo_ataque: angulo
        })
      };

      const { error } = await supabase.from(TABLE_LEADS).insert([missionPayload]);
      if (error) console.error("Error saving mission:", error);

      toast.success("Misión Sincronizada", {
        description: "El motor Nexus ha sido configurado con tu ángulo de ataque.",
      });
    } catch (err) {
      toast.error("Error de Sincronización");
    } finally {
      setIsRadarRunning(false);
    }
  }, []);

  const runRadar = useCallback(async (url1: string, url2: string, context?: any) => {
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
    <RadarContext.Provider value={{ isRadarRunning, runRadar, runNexusHunt }}>
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
