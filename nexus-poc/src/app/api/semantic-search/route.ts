import { NextRequest, NextResponse } from "next/server";
import { embedText } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { query, filter_pais, filter_vertical, filter_tier, match_threshold = 0.5, match_count = 5 } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Generar Embedding
    console.log(`[SEMANTIC SEARCH] Generando embedding para: "${query}"`);
    const embedding = await embedText(query);

    // 2. Llamar RPC en Supabase
    const { data: matches, error } = await supabase.rpc("match_empresas", {
      query_embedding: embedding,
      match_threshold: match_threshold,
      match_count: match_count,
      filter_pais: filter_pais || null,
      filter_vertical: filter_vertical || null,
      filter_tier: filter_tier || null
    });

    if (error) {
      console.error("[SEMANTIC SEARCH ERROR]:", error);
      throw error;
    }

    console.log(`[SEMANTIC SEARCH] Encontrados ${matches?.length || 0} resultados.`);

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error("SEMANTIC_SEARCH_CRITICAL_ERROR:", error);
    return NextResponse.json(
      { error: "Error en la búsqueda semántica", details: error.message },
      { status: 500 }
    );
  }
}
