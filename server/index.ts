const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';

import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './routers/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // tRPC Middleware
  app.use(
    '/api/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
    })
  );

  // New AI Endpoints for Advanced Mode
  app.post("/api/discover-products", async (req, res) => {
    const { url } = req.body;
    try {
      const { scrapeUrl, askGemini } = await import('./lib/ai');
      const markdown = await scrapeUrl(url);
      const prompt = `Analiza el sitio web de esta empresa: ${markdown.substring(0, 15000)}
      
      TU OBJETIVO: Definir la Identidad Estratégica de la empresa para un Plan de Ataque GTM.
      
      Responde ÚNICAMENTE en JSON con esta estructura:
      {
        "empresa": "Nombre Legal/Comercial",
        "mision_gtm": "Descripción de 1 párrafo sintetizando su ventaja competitiva técnica.",
        "ofertas_valor": [
          { "nombre": "Nombre de la Oferta (ej: Managed Payments)", "descripcion": "Descripción de alto valor enfocada en beneficios de negocio." },
          { "nombre": "...", "descripcion": "..." },
          { "nombre": "...", "descripcion": "..." }
        ],
        "icp_deducido": {
          "industria": "Segmento exacto",
          "tamano": "Rango de empleados (ej: 250-1000)",
          "geografia": "Regiones clave",
          "triggers": ["Trigger 1", "Trigger 2"]
        }
      }`;
      const result = await askGemini(prompt);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/nexus-v2", async (req, res) => {
    const { vendedorUrl, objetivoUrl, productosSeleccionados, contextoVendedor, empresaName } = req.body;
    try {
      const { scrapeUrl, askGemini } = await import('./lib/ai');
      const [mdV, mdO] = await Promise.all([scrapeUrl(vendedorUrl), scrapeUrl(objetivoUrl)]);
      
      const prompt = `
      SISTEMA: NERV Strategic Command Center (Strategic Precision Mode).
      
      IDENTIDAD ESTRATÉGICA VENDEDOR: ${empresaName} - URL: ${vendedorUrl}
      PRODUCTOS SELECCIONADOS: ${productosSeleccionados}
      
      WEB VENDEDOR (EXTRACTO): ${mdV.substring(0, 8000)}
      WEB CUENTA ESTRATÉGICA (OBJETIVO): ${mdO.substring(0, 10000)}
      
      CONTEXTO ADICIONAL (DATOS FORENSES):
      - Tier: ${req.body.tier || 'No clasificada'}
      - Tech Stack Detectado: ${JSON.stringify(req.body.tech_summary || {})}
      - Señal de Crecimiento Activa: ${req.body.signal_type || 'N/A'}
      
      TU OBJETIVO: Generar un Dossier Forense de la CUENTA ESTRATÉGICA. 
      REGLA CRÍTICA: Si el Tier es "Tier1", el Gancho (The Hook) DEBE mencionar explícitamente el CRM detectado.
      Ejemplo: "Dado que ya utilizan [CRM], NERV puede enriquecer sus registros con inteligencia de mercado en tiempo real sin fricción."
      
      ESTRUCTURA DEL RESULTADO (JSON):
      {
        "empresa": "Nombre de la Cuenta",
        "tier": "${req.body.tier || 'Tier3'}",
        "icp_fit": <0-100>,
        "diagnostico_organizacional": {
          "señal_de_crecimiento": "Señal real de que necesitan evolucionar/crecer.",
          "fricción_operativa": "Punto de dolor técnico o de negocio visible.",
          "alineación_estratégica": "Conexión directa entre la oferta y el dolor."
        },
        "markdown": "# Dossier de Inteligencia Estratégica: [Nombre]\n\n## 🎯 Executive Summary\n[...]\n\n## 🔎 Señales de Crecimiento (Forensic Analysis)\n[...]\n\n## ⚡ Punto de Entrada (The Hook)\n[...] "
      }`;
      const result = await askGemini(prompt);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/prospect-portfolio", async (req, res) => {
    const { vendedorUrl, pais, vertical, empresaName, contexto_productos } = req.body;
    try {
      const { askGemini, scrapeUrl } = await import('./lib/ai');
      const mdV = await scrapeUrl(vendedorUrl);
      
      const prompt = `
      SISTEMA: NERV Strategic Analysis Engine.
      
      IDENTIDAD VENDEDOR: ${empresaName}
      CONTEXTO PRODUCTOS: ${JSON.stringify(contexto_productos)}
      WEB VENDEDOR (EXTRACTO): ${mdV.substring(0, 8000)}
      
      MERCADO OBJETIVO: ${vertical} en ${pais}
      
      TU OBJETIVO: Generar un Portafolio de Oportunidades (10 Cuentas Estratégicas).
      Deben ser organizaciones REALES. Prioriza aquellas que tengan señales de crecimiento recientes.
      
      ESTRUCTURA DEL RESULTADO (JSON):
      {
        "estrategia_macro": "Directiva de 2 párrafos sobre cómo abordar este mercado.",
        "portfolio": [
          {
            "empresa": "Nombre de la Cuenta",
            "url": "URL (opcional)",
            "sector": "Sub-sector",
            "dolor": "Descripción del gap que resolvemos.",
            "gancho": "Punto de entrada irresistible.",
            "score": <0-100>
          }
        ]
      }`;
      const result = await askGemini(prompt);
      
      // Enriquecimiento con Tier Scoring real de base de datos
      const { db } = await import('./lib/db');
      const enrichedPortfolio = await Promise.all(result.portfolio.map(async (p: any) => {
         const { data, error } = await (await import('./lib/db')).supabase
           .from('empresas_v3')
           .select('nombre, website, vertical, growth_signals(signal_type, score_momento), tech_stack(tech_crm, tech_pagos, tech_kyc)')
           .or(`nombre.ilike.%${p.empresa}%,website.ilike.%${p.empresa}%`)
           .limit(1)
           .single();
         
         if (data) {
            return (await import('./lib/db')).db.empresas.injectTierScoring(data);
         }
         return { ...p, tier: "Tier3", signal_type: "N/A", tech_summary: { crm: "No detectado" } };
      }));

      res.json({ ...result, portfolio: enrichedPortfolio });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`tRPC endpoint available at http://localhost:${port}/api/trpc`);
  });
}

startServer().catch(console.error);
