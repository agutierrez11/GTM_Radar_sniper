import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { supabaseRouteAnon as supabase } from "@/lib/supabase-route-anon";
import { searchTavily } from "@/lib/tavily";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

// [MIROFISH SWARM ENGINE BRIDGE]
// Integración con el framework 666ghj/MiroFish corriendo en localhost:5001
async function triggerMiroFishSwarm(payload: any) {
  try {
    console.log("[MIROFISH] Iniciando inyección al Swarm Intelligence Engine...");
    
    // Paso 1: Crear simulación en el backend de Python
    const createRes = await fetch("http://localhost:5001/api/simulation/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: `nerv_gtm_${Date.now()}`,
        enable_twitter: true,
        enable_reddit: true
      })
    });
    
    if (!createRes.ok) {
       console.log("[MIROFISH-WARNING] Framework no detectado en el puerto 5001. Cayendo al MiroFish Protocol (Prompt-based).");
       return null;
    }
    
    const simData = await createRes.json();
    console.log(`[MIROFISH] Simulación creada: ${simData.data.simulation_id}`);
    
    // En una implementación total, aquí llamaríamos a /api/simulation/prepare 
    // y conectaríamos el webhook. Por ahora se retorna la señal de inicio.
    return simData.data.simulation_id;
  } catch (e) {
    console.log("[MIROFISH-WARNING] El servidor Swarm Engine (Python) no está activo. Activando fallback.");
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { vendedorUrl, pais, vertical, productosSeleccionados, empresaName } = await req.json();

    // 1. Intentar Búsqueda Vectorial (pgvector) — skip si Google pausado
    const queryText = `Empresa B2B buscando clientes en el sector ${vertical} de ${pais} para vender: ${productosSeleccionados.join(', ')}. Necesitamos prospectos afines.`;
    let leads = null;
    let usingVectorSearch = false;

    if (process.env.GOOGLE_APIS_PAUSED === "true") {
      console.log("[PROSPECT] GOOGLE_APIS_PAUSED=true — saltando pgvector, usando fallback estático");
    } else
    try {
       const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_PROFESSIONAL || process.env.GEMINI_API_KEY || "");
       const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
       const result = await model.embedContent(queryText);
       const embedding = result.embedding.values;

       const { data: v3Leads, error: v3Error } = await supabase.rpc('match_empresas', {
         query_embedding: embedding,
         match_threshold: 0.1, // Tolerancia amplia para asegurar el llenado de 12 leads
         match_count: 12,
         filter_pais: pais
       });

       if (!v3Error && v3Leads && v3Leads.length > 0) {
         leads = v3Leads;
         usingVectorSearch = true;
         console.log(`[PGVECTOR HIT] ${v3Leads.length} leads encontrados semánticamente.`);
       } else {
         console.log("[PGVECTOR MISS] Sin matches o tabla vacía. Activando fallback estático.");
       }
    } catch(err) {
       console.warn("Error en pgvector, fallback a query estática:", err);
    }

    // Fallback a búsqueda estática en v2 si pgvector falla/esta vacío
    if (!leads) {
      const { data: v2Leads, error } = await supabase
        .from('empresas_v2')
        .select('name, description, vertical_finnovista, product_category, country, website')
        .eq('country', pais)
        .ilike('vertical_finnovista', `%${vertical.split(' ')[0]}%`)
        .limit(12);
      
      if (error) throw error;
      leads = v2Leads;
    }

    // 2. Investigación de mercado rápida para el contexto del sector
    const marketIntel = await searchTavily(`top fintech trends and business pain points in ${pais} ${vertical} 2024`);

    // 3. INTENTO DE DELEGAR AL ENJAMBRE REAL (MIROFISH FRAMEWORK)
    const activeSimulationId = await triggerMiroFishSwarm({ 
      leads, 
      marketIntel, 
      target: { vendedorUrl, pais, vertical, productosSeleccionados }
    });

    if (activeSimulationId) {
      console.log(`[MIROFISH] Delegando inferencia a la arquitectura GraphRAG: ${activeSimulationId}`);
      // Lógica futura: Hacer polling o sockets a MiroFish.
    }

    // 4. Prompt de Prospección de Alto Nivel (Fallback Rápido de NERV)
    const prompt = `
Eres NERV — el motor de inteligencia de ventas más avanzado de Latam.
OBJETIVO: Generar un PORTAFOLIO DE PROSPECTOS (Hit List) para ${empresaName || vendedorUrl}.

PRODUCTO A VENDER: ${productosSeleccionados.join(", ")}
MERCADO: ${vertical} en ${pais}.

DATOS DE PROSPECTOS (SUPABASE):
${JSON.stringify(leads)}

CONTEXTO DE MERCADO (TAVILY):
${marketIntel?.answer || "Foco en eficiencia operativa y expansión regional."}

CONSEJO EXPERTO (MEXICO PAYMENTS):
En México no gana el que "procesa", gana el que rutea bien. Un BIN local de débito no se comporta igual que un neobanco o crédito internacional. Quien no optimiza el ruteo tiene más declines y menos conversión. USA ESTO EN LOS GANCHOS.

INSTRUCCIÓN:
Selecciona los 8 mejores prospectos de la lista (o añade líderes del sector si la lista es corta). 
Para cada uno, define un "Dolor Crítico" real y un "Gancho Forense" basado en el producto del vendedor.

RESPONDE ÚNICAMENTE CON UN JSON VÁLIDO:
{
  "portfolio": [
    {
      "empresa": "Nombre",
      "url": "URL del sitio web (extraída de los datos o buscada)",
      "sector": "Sub-sector específico",
      "dolor": "Dato/Problema específico",
      "gancho": "Apertura irresistible",
      "score": <int 0-100>
    }
  ],
  "estrategia_macro": "Resumen de cómo conquistar este mercado en 2 frases."
}

REGLA DE ORO: USA NOMBRES REALES. NADA DE PLACEHOLDERS.
`;

    try {
      const gResp = await generateWithFallback(prompt);
      return NextResponse.json(gResp.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("PROSPECT_PORTFOLIO_LLM:", err);
      return NextResponse.json({ error: msg || "Fallo del modelo (Gemini)" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("PROSPECT_PORTFOLIO_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
