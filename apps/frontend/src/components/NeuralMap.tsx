"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';

interface NeuralMapProps {
  points?: Array<{ lat: number; lng: number; size: number; color: string }>;
}

export default function NeuralMap({ points = [] }: NeuralMapProps) {
  const globeRef = useRef<any>(null);

  // Datos semilla para el efecto "Ecosistema Vivo" en LatAm
  const defaultHubs = useMemo(() => [
    { lat: 19.4326, lng: -99.1332, size: 0.5, color: '#5E6AD2', label: 'CDMX HUB' },
    { lat: 4.7110, lng: -74.0721, size: 0.4, color: '#5E6AD2', label: 'BOGOTÁ CORE' },
    { lat: -23.5505, lng: -46.6333, size: 0.6, color: '#5E6AD2', label: 'SAO PAULO NODE' },
    { lat: -33.4489, lng: -70.6693, size: 0.3, color: '#5E6AD2', label: 'SANTIAGO EDGE' },
    { lat: -34.6037, lng: -58.3816, size: 0.4, color: '#5E6AD2', label: 'BUE SYNC' },
  ], []);

  useEffect(() => {
    if (globeRef.current) {
      // Configuración de la "Órbita Cinética"
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.45;
      globeRef.current.controls().enableZoom = false;
      
      // Point of interest: LatAm
      globeRef.current.pointOfView({ lat: -15, lng: -60, altitude: 2.2 }, 0);
    }
  }, []);

  return (
    <div className="neural-map-container w-full h-full relative overflow-hidden bg-transparent select-none">
       {/* Degradado de profundidad superior */}
       <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-white via-transparent to-white opacity-20" />
       
       <Globe
         ref={globeRef}
         backgroundColor="rgba(0,0,0,0)"
         showAtmosphere={true}
         atmosphereColor="#5E6AD2"
         atmosphereAltitude={0.15}
         
         // Configuración de Superficie (Estilo Red Neuronal)
         globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
         bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
         
         // Anillos de Latido (Pulsos de Inteligencia)
         ringsData={defaultHubs}
         ringColor={() => "#5E6AD2"}
         ringMaxRadius={2.5}
         ringPropagationSpeed={2.5}
         ringRepeatPeriod={800}
         
         // Arcos de Conexión (Crecimiento)
         arcsData={[]} // Reservado para futura expansión estética
         arcColor={() => "#5E6AD2"}
         arcDashLength={0.4}
         arcDashGap={4}
         arcDashAnimateTime={1500}
         
         // Estética de puntos (Hubs)
         pointsData={defaultHubs}
         pointColor={() => "#5E6AD2"}
         pointAltitude={0}
         pointRadius={0.03}
         
         width={1000}
         height={1000}
       />
       
       {/* Overlay Estético McKinsey Style */}
       <div className="absolute bottom-10 left-10 z-20 border-l border-[#5E6AD2] pl-4 opacity-40">
          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">NERV Neural Map v1.0</div>
          <div className="text-[9px] font-bold text-[#5E6AD2] uppercase tracking-[0.2em]">Ecosistema Latidante: LatAm Region</div>
       </div>
    </div>
  );
}
