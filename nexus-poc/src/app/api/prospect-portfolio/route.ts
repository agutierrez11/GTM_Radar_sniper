import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { generateWithGroq } from "@/lib/groq";
import { supabase } from "@/lib/supabase";
import { searchTavily } from "@/lib/tavily";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { vendedorUrl, pais, vertical, productosSeleccionados, empresaName } = await req.json();

    // 1. Intentar Búsqueda Vectorial (pgvector)
    const queryText = `Empresa B2B buscando clientes en el sector ${vertical} de ${pais} para vender: ${productosSeleccionados.join(', ')}. Necesitamos prospectos afines.`;
    let leads = null;
    let usingVectorSearch = false;

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

    // 3. Prompt de Prospección de Alto Nivel
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
    } catch (err: any) {
      console.warn("Gemini falló en portfolio, intentando Groq...");
      const groqData = await generateWithGroq(prompt);
      return NextResponse.json(groqData);
    }

  } catch (error: any) {
    console.error("PROSPECT_PORTFOLIO_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
