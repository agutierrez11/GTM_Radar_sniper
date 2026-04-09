import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseDiscovery as supabase } from "@/lib/supabase-discovery";

export const dynamic = "force-dynamic";

/**
 * POST /api/discovery
 * Búsqueda semántica de empresas en lenguaje natural.
 * Ejemplo: "quiero casinos en Brasil" → devuelve empresas iGaming en Brasil
 *
 * Usa match_empresas RPC (pgvector sobre empresas_v3, text-embedding-004, 768-dim)
 * Extrae filtros (pais, vertical) con LLM antes de buscar.
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query requerida" }, { status: 400 });
    }

    // ── Paso 1: Extraer filtros con Gemini (JSON) ──
    let pais: string | null = null;
    let vertical: string | null = null;

    const filterKey =
      process.env.GEMINI_API_KEY_PROFESSIONAL ||
      process.env.GEMINI_API_KEY_1 ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY;

    try {
      if (filterKey) {
        const genAIFilter = new GoogleGenerativeAI(filterKey);
        const filterModel = genAIFilter.getGenerativeModel({
          model: "gemini-3-flash-preview",
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 200,
            temperature: 0.1,
          },
        });
        const filterPrompt = `Extrae los filtros de esta búsqueda de empresas fintech: "${query}"
Responde SOLO con JSON válido (sin markdown):
{
  "pais": "México" | "Colombia" | "Brasil" | "Chile" | "Argentina" | "Perú" | null,
  "vertical": "Payments & Remittances" | "Lending" | "Digital Banking" | "Tech Infrastructure" | "Open Finance" | "Insurtech" | "Enterprise Financial Mgmt" | "Crypto & Blockchain" | "Wealth Management" | "Proptech" | "Crowdfunding" | "Personal Financial Management" | null
}
Si no se menciona país o vertical, deja null.
"casino", "igaming", "juegos" → vertical: "Payments & Remittances"
"crédito", "préstamo" → vertical: "Lending"
"banco", "neobank" → vertical: "Digital Banking"`;
        const fr = await filterModel.generateContent(filterPrompt);
        const raw = fr.response.text();
        const parsed = JSON.parse(raw) as { pais?: string | null; vertical?: string | null };
        pais = parsed.pais ?? null;
        vertical = parsed.vertical ?? null;
      }
    } catch (e) {
      console.warn("[DISCOVERY] Gemini filter extraction failed, proceeding without filters:", e);
    }

    // ── Paso 2 & 3: Embedding + búsqueda vectorial (skip si Google pausado) ──
    let empresas: any[] = [];
    let usedFallback = false;

    if (process.env.GOOGLE_APIS_PAUSED !== "true") {
      try {
        const apiKey =
          process.env.GEMINI_API_KEY_PROFESSIONAL ||
          process.env.GEMINI_API_KEY_1 ||
          process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY;

        const genAI = new GoogleGenerativeAI(apiKey!);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embedResult = await model.embedContent(query);
        const embedding = Array.from(embedResult.embedding.values);

        const { data: results, error } = await supabase.rpc("match_empresas", {
          query_embedding: embedding,
          match_threshold: 0.1,
          match_count: 12,
          filter_pais: pais,
        });

        if (!error && results && results.length > 0) {
          empresas = results;
          console.log(`[DISCOVERY] pgvector: ${results.length} empresas`);
        }
      } catch (e) {
        console.warn("[DISCOVERY] Embedding falló, usando fallback de texto:", e);
      }
    } else {
      console.log("[DISCOVERY] GOOGLE_APIS_PAUSED=true — usando búsqueda por texto");
    }

    if (empresas.length === 0) {
      usedFallback = true;
      console.log("[DISCOVERY] pgvector miss — fallback a búsqueda por campos");

      // Intento 1: pais_hq + vertical
      if (pais && vertical) {
        const { data } = await supabase
          .from("empresas_v3")
          .select("id, nombre, vertical, pais_hq, uvp, website, tier")
          .ilike("pais_hq", `%${pais}%`)
          .ilike("vertical", `%${vertical.split(" ")[0]}%`)
          .limit(12);
        empresas = data || [];
      }

      // Intento 2: solo pais_hq
      if (empresas.length === 0 && pais) {
        const { data } = await supabase
          .from("empresas_v3")
          .select("id, nombre, vertical, pais_hq, uvp, website, tier")
          .ilike("pais_hq", `%${pais}%`)
          .limit(12);
        empresas = data || [];
      }

      // Intento 3: solo vertical
      if (empresas.length === 0 && vertical) {
        const { data } = await supabase
          .from("empresas_v3")
          .select("id, nombre, vertical, pais_hq, uvp, website, tier")
          .ilike("vertical", `%${vertical.split(" ")[0]}%`)
          .limit(12);
        empresas = data || [];
      }

      // Intento 4: tier 1 (texto o numérico en DB)
      if (empresas.length === 0) {
        const { data: d1 } = await supabase
          .from("empresas_v3")
          .select("id, nombre, vertical, pais_hq, uvp, website, tier")
          .eq("tier", "1")
          .limit(12);
        empresas = d1 || [];
        if (empresas.length === 0) {
          const { data: d2 } = await supabase
            .from("empresas_v3")
            .select("id, nombre, vertical, pais_hq, uvp, website, tier")
            .eq("tier", 1)
            .limit(12);
          empresas = d2 || [];
        }
      }

      // Intento 5: cualquier muestra (último recurso)
      if (empresas.length === 0) {
        const { data } = await supabase
          .from("empresas_v3")
          .select("id, nombre, vertical, pais_hq, uvp, website, tier")
          .limit(12);
        empresas = data || [];
      }
    }

    return NextResponse.json({
      query,
      filtros_detectados: { pais, vertical },
      total: empresas.length,
      used_fallback: usedFallback,
      empresas: empresas.map((e: any) => ({
        id: e.id,
        nombre: e.nombre || e.name,
        vertical: e.vertical || e.vertical_finnovista,
        pais: e.pais_hq || e.pais || e.country,
        descripcion: e.uvp || e.descripcion || e.description || null,
        website: e.website || null,
        icp_score: e.tier ? (e.tier === "1" ? 90 : e.tier === "2" ? 70 : 50) : null,
        similarity: e.similarity || null,
      })),
    });
  } catch (err: any) {
    console.error("[DISCOVERY ERROR]", err?.message);
    return NextResponse.json({ error: err?.message || "Error en Discovery" }, { status: 500 });
  }
}
