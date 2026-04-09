import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

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

    // ── Paso 1: Extraer filtros con Groq (rápido, JSON garantizado) ──
    let pais: string | null = null;
    let vertical: string | null = null;

    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: "user",
            content: `Extrae los filtros de esta búsqueda de empresas fintech: "${query}"
Responde SOLO con JSON:
{
  "pais": "México" | "Colombia" | "Brasil" | "Chile" | "Argentina" | "Perú" | null,
  "vertical": "Payments & Remittances" | "Lending" | "Digital Banking" | "Tech Infrastructure" | "Open Finance" | "Insurtech" | "Enterprise Financial Mgmt" | "Crypto & Blockchain" | "Wealth Management" | "Proptech" | "Crowdfunding" | "Personal Financial Management" | null
}
Si no se menciona país o vertical, deja null.
"casino", "igaming", "juegos" → vertical: "Payments & Remittances"
"crédito", "préstamo" → vertical: "Lending"
"banco", "neobank" → vertical: "Digital Banking"`
          }],
          max_tokens: 100,
          response_format: { type: "json_object" },
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const parsed = JSON.parse(groqData.choices[0].message.content);
        pais = parsed.pais ?? null;
        vertical = parsed.vertical ?? null;
      }
    } catch (e) {
      console.warn("[DISCOVERY] Groq filter extraction failed, proceeding without filters:", e);
    }

    // ── Paso 2 & 3: Embedding + búsqueda vectorial (skip si Google pausado) ──
    let empresas: any[] = [];
    let usedFallback = false;

    if (process.env.GOOGLE_APIS_PAUSED !== "true") {
      try {
        const apiKey = process.env.GEMINI_API_KEY_PROFESSIONAL
          || process.env.GEMINI_API_KEY_1
          || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

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

      // Intento 4: top tier sin filtros
      if (empresas.length === 0) {
        const { data } = await supabase
          .from("empresas_v3")
          .select("id, nombre, vertical, pais_hq, uvp, website, tier")
          .eq("tier", "1")
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
