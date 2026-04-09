import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "../../../lib/gemini";
import { generateWithGroq } from "../../../lib/groq";
import { supabase as db } from "../../../lib/supabase";
import { searchTavily } from "../../../lib/tavily";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendedorUrl, objetivoUrl, pais, vertical, productosSeleccionados, tier, empresaName, contexto_productos } = body;

    const fcKey = process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY_2;

    // 1. Simultaneous Scrape (Optional for Objetivo)
    const scrapeTasks = [
      fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${fcKey}` },
        body: JSON.stringify({ url: vendedorUrl, formats: ["markdown"] })
      }).then(r => r.json())
    ];

    if (objetivoUrl && objetivoUrl.includes(".")) {
      scrapeTasks.push(
        fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${fcKey}` },
          body: JSON.stringify({ url: objetivoUrl, formats: ["markdown"] })
        }).then(r => r.json())
      );
    }

    // 1. Data Gathering (Scrape + Search + DB)
    const [resVendedor, resObjetivo] = await Promise.all(scrapeTasks);
    
    let mdVendedor = resVendedor?.success ? resVendedor.data?.markdown : null;
    let mdObjetivo = (resObjetivo && resObjetivo.success) ? resObjetivo.data?.markdown : null;

    // FALLBACK SI FIRECRAWL FALLA (Quota o Bloqueo)
    if (!mdVendedor) {
      console.warn("FIRECRAWL_VENDEDOR_FAILED: Attempting Tavily Fallback...");
      const tavilyVendedor = await searchTavily(`what does ${empresaName || vendedorUrl} do? products and services summary`);
      mdVendedor = tavilyVendedor?.answer || JSON.stringify(tavilyVendedor?.results?.map((r: any) => r.content)) || "No se pudo obtener data del vendedor.";
    }

    if (!mdObjetivo && objetivoUrl) {
       console.warn("FIRECRAWL_OBJETIVO_FAILED: Attempting Tavily Fallback...");
       const tavilyObjetivo = await searchTavily(`about company ${objetivoUrl} business model and industry`);
       mdObjetivo = tavilyObjetivo?.answer || JSON.stringify(tavilyObjetivo?.results?.map((r: any) => r.content)) || "Error al obtener data del objetivo.";
    } else if (!mdObjetivo) {
       mdObjetivo = "SIN OBJETIVO ESPECÍFICO (Análisis de Mercado General)";
    }

    console.log("DB_LOOKUP_START:", { pais, vertical });
    const [searchMarket, dbCompetitors] = await Promise.all([
      searchTavily(`fintech market triggers and news 2024 ${pais} ${vertical}`),
      db.from('empresas_v2')
        .select('name, description, competitors_verified')
        .eq('country', pais)
        .ilike('segment_latamfintech', `%${vertical.split(' ')[0]}%`)
        .limit(5)
    ]);

    if (!dbCompetitors) {
      console.error("DB_COMPETITORS_IS_UNDEFINED");
    }

    // Competidores: Combinar DB y Búsqueda si es necesario
    const realCompetitors = dbCompetitors?.data?.map((c: any) => `${c.name} (${c.competitors_verified?.join(', ') || 'Nativa'})`).join('; ') || "";
    const marketIntel = searchMarket?.answer || JSON.stringify(searchMarket?.results?.slice(0, 3).map((r: any) => r.content)) || "";

    // 2. High-Fidelity Prompt for Advanced Mode (v11.5 - Forensic DB Integration)
    const prompt = `
Eres NERV — el sistema de inteligencia estratégica GTM (v11.5). 
TU OBJETIVO: Generar un Dossier de Inteligencia Forense con NOMBRES REALES Y DATOS VERIFICABLES.

PROHIBICIÓN ABSOLUTA: 
- Prohibido usar "Competidor 1", "Empresa A", "Placeholder". 
- Si no conoces un nombre, NO LO INVENTES. Usa los nombres reales de la BASE DE DATOS y la INVESTIGACIÓN que te proporciono.

DATOS DEL ECOSISTEMA (GROUND TRUTH):
- **VENDEDOR:** ${empresaName} (URL: ${vendedorUrl}).
- **PRODUCTO:** ${productosSeleccionados.join(", ")}.
- **MERCADO:** ${vertical} en ${pais}.

INVESTIGACIÓN DE MERCADO REAL:
--- COMPETIDORES VERIFICADOS EN DB ---
${realCompetitors}
---

--- SEÑALES Y DISRUPTORES TAVILY ---
${marketIntel}
---

CONTENIDO EXTRAÍDO (SITIO WEB):
--- VENDEDOR MARKDOWN ---
${mdVendedor.substring(0, 8000)}
---

--- OBJETIVO MARKDOWN ---
${mdObjetivo.substring(0, 10000)}
---

PROTOCOLO DE INTELIGENCIA:
1. **Diferenciación Brutal:** Compara a ${empresaName} contra los competidores reales mencionados arriba. ¿Por qué ganaría?
2. **Segmentación Quirúrgica:** Identifica a qué sub-segmentos en ${pais} les duele más no tener ${empresaName}.
3. **Puntos de Dolor Reales:** Evita el marketing. Habla de costos operativos, cumplimiento regulatorio o fricción de usuario.
4. **Análisis de la Competencia:** Usa los nombres REALES (Clip, Konfío, Kushki, etc.) para armar la comparativa.
5. **The Hook (Conversión Crítica):** En México no gana el que "procesa", gana el que rutea bien (BINs Locales vs Int, Débito vs Neobancos). Si el prospecto no está mirando esto, está dejando dinero sobre la mesa.

ESTRUCTURA DEL RESULTADO (JSON):
{
  "empresa": "${empresaName || "Empresa"}",
  "tier": "${tier}",
  "icp_score": <int>,
  "latido_mercado": "<Trigger de mercado real en ${pais}>",
  "diagnostico": {
    "friccion_operativa": "<Dato técnico duro>",
    "dolor_critico": "<Impacto en negocio>",
    "resolucion_tactica": "<Ventaja competitiva vs competidores reales>"
  },
  "plan_ataque": {
    "schwerpunkt": "<Persona clave + Incentivo>",
    "flanqueo": "<Estrategia de entrada>",
    "apertura": "<Elevator Pitch con datos reales>"
  },
  "auditoria": {
    "abogado_diablo": "<Riesgos>",
    "sesgo": "<Data faltante>",
    "confianza": "ALTA"
  },
  "markdown": "<Ficha Dossier Forense COMPLETA. Usa tablas comparativas con los competidores REALES mencionados. Zero placeholders.>"
}
`;

    // 3. Generate Analysis
    try {
      const gResp = await generateWithFallback(prompt);
      return NextResponse.json(gResp.data);
    } catch (err: any) {
      console.warn("Gemini falló, intentando Groq...");
      const groqData = await generateWithGroq(prompt);
       return NextResponse.json(groqData);
    }

  } catch (error: any) {
    console.error("NEXUS_V2_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
