import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "../../../lib/gemini";
import { generateWithClaude } from "../../../lib/claude";
import { generateWithGroq } from "../../../lib/groq";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log(`NEXUS_API_DEPLOY_VERSION: 1.6.0 - SWARM_RAG_V3.1`);
  try {
    const body = await req.json();
    const { brief, empresa_supabase, competidores, clientes_potenciales, vendor_data } = body;
    const isVendorMode = !!vendor_data;

    // --- FASE 0: RAG (Retrieval Augmented Generation) ---
    let ragContext = "No document evidence found in Knowledge Base.";
    let ragChunks: Array<{ content: string; similarity: number; source: string }> = [];
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const api_key = process.env.GEMINI_API_KEY_1 || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(api_key!);
      const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

      const queryText = `${brief.empresa} ${brief.producto} ${brief.vertical} ${brief.pais}`;
      const embedResult = await embedModel.embedContent({ content: { parts: [{ text: queryText }] }, outputDimensionality: 768 } as any);
      const embedding = embedResult.embedding.values;

      const { data: knowledge, error: ragError } = await (await import("../../../lib/supabase")).supabase
        .rpc("match_knowledge", {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 5,
        });

      if (!ragError && knowledge && knowledge.length > 0) {
        ragChunks = knowledge.map((k: any) => ({
          content: k.content,
          similarity: k.similarity ?? 0,
          source: k.metadata?.source ?? "unknown",
        }));
        ragContext = ragChunks.map((c) => c.content).join("\n---\n");
        console.log(`[RAG HIT] ${ragChunks.length} chunks, avg_sim=${(ragChunks.reduce((a, c) => a + c.similarity, 0) / ragChunks.length).toFixed(3)}`);
      }
    } catch (ragErr) {
      console.warn("[RAG WARN] Retrieval failed, proceeding with baseline data:", ragErr);
    }

    // --- AGENTE 1: EL COSECHADOR (Facts & Signals) ---
    const harvesterPrompt = isVendorMode
      ? `Eres el Harvester Agent de NERV en modo VENDOR ATTACK.
      Tu misión: Encuentra los 3 puntos de dolor más críticos del TARGET "${brief.empresa}" que la UVP del VENDEDOR "${vendor_data.nombre}" puede resolver directamente.

      UVP del Vendedor: ${vendor_data.uvp}
      Killer Argument del Vendedor: ${vendor_data.killer_argument}
      Datos del Target en Supabase: ${JSON.stringify(empresa_supabase)}
      Evidencia Documental (RAG): ${ragContext}

      Responde con 3 dolores específicos y cuantificables. No hables, solo los hechos.`
      : `Eres el AGENTE COSECHADOR de NERV.
      Tu misión: Extraer señales forenses puras de estos datos:

      DATOS ESTRUCTURADOS: ${JSON.stringify({ brief, empresa_supabase, competidores })}
      PROSPECTOS SUGERIDOS: ${JSON.stringify(clientes_potenciales || [])}
      EVIDENCIA DOCUMENTAL (RAG): ${ragContext}

      Reglas:
      1. Identifica el dolor técnico de la PRESA (${brief.vertical} en ${brief.pais}).
      2. PRIORIZA la EVIDENCIA DOCUMENTAL (RAG) si está disponible.
      Responde con una lista de 5 hechos brutales. No hables, solo los hechos.`;
    const harvestResult = await generateWithFallback(harvesterPrompt);
    const facts = harvestResult.data;

    // --- AGENTE 2: EL ABOGADO DEL DIABLO (Red Teaming) ---
    const challengerPrompt = `
      Eres el AGENTE RETADOR de NERV (Red Team).
      Se ha propuesto que ${brief.empresa} ataque con ${brief.producto} basándose en estos hechos:
      ${JSON.stringify(facts)}

      Tu misión: Destruye la propuesta. Busca por qué NO funcionaría.
      ¿Qué objeciones pondría un CTO escéptico?
      Responde con 3 debilidades críticas.
    `;
    const challengeResult = await generateWithFallback(challengerPrompt);
    const objections = challengeResult.data;

    // --- AGENTE 3: EL SINTETIZADOR (RaiSE v3.1) ---
    const finalPrompt = `
      Eres el SINTETIZADOR ESTRATÉGICO de NERV (v5.5).
      Tienes:
      1. Datos Crudos: ${JSON.stringify(brief)}
      2. Hechos Forenses: ${JSON.stringify(facts)}
      3. Crítica del Red Team: ${JSON.stringify(objections)}
      4. Prospectos: ${JSON.stringify(clientes_potenciales || [])}

      Tu misión: Generar el Dossier Forense Final que resuelva el debate anterior.
      Sigue el protocolo RaiSE v3.1.

      ESTRUCTURA JSON:
      {
        "empresa": "${brief.empresa}",
        "tier": "${brief.tier}",
        "icp_score": <int>,
        "latido_mercado": "<Trigger real>",
        "analisis_forense": {
          "inferencia_raise": "...",
          "friccion_tecnica": "...",
          "dolor_financiero": "..."
        },
        "diagnostico": {
          "friccion_operativa": "...",
          "dolor_critico": "...",
          "resolucion_tactica": "..."
        },
        "plan_ataque": {
          "schwerpunkt": "...",
          "flanqueo": "...",
          "apertura": "..."
        },
        "auditoria": {
          "abogado_diablo": "La crítica más dura del Red Team resumida en una línea",
          "sesgo": "Sesgo detectado en el análisis (ej: datos limitados, mercado sesgado)",
          "confianza": "ALTO | MEDIO | BAJO"
        },
        "similares": [],
        "competidores": ${JSON.stringify(competidores || [])},
        "clientes_potenciales": ${JSON.stringify(clientes_potenciales || [])},
        "markdown": "..."${isVendorMode ? `,
        "vendor_attack": {
          "arma": "UVP del vendedor en máximo 20 palabras",
          "dolor": "El dolor específico del target que mejor encaja con la UVP",
          "sutura": "Cómo el vendedor resuelve ese dolor paso a paso",
          "apertura_recomendada": "Línea exacta de apertura para el primer contacto con el target"
        }` : ""}
      }
    `;

    const gResp = await generateWithFallback(finalPrompt);

    // --- METACOGNICIÓN DETERMINISTA ---
    // Confianza calculada desde RAG similarity scores — no es opinión del LLM.
    // El LLM genera auditoria.confianza subjetivo; este bloque lo sobreescribe con matemática real.
    const synthOutput = gResp.data ?? {};
    const ragCount = ragChunks.length;
    const avgSim = ragCount > 0
      ? ragChunks.reduce((a, c) => a + c.similarity, 0) / ragCount
      : 0;
    const computedConfianza: "ALTO" | "MEDIO" | "BAJO" =
      ragCount === 0        ? "BAJO"
      : avgSim >= 0.65      ? "ALTO"
      : avgSim >= 0.52      ? "MEDIO"
      : "BAJO";

    if (synthOutput?.auditoria) {
      synthOutput.auditoria.confianza = computedConfianza;
    }

    return NextResponse.json({
      ...synthOutput,
      logId: null,
      cached: false,
      swarm_mode: true,
      mode: isVendorMode ? 'vendor_attack' : 'standard',
      rag_evidence: {
        chunks_retrieved: ragCount,
        avg_similarity: Math.round(avgSim * 1000) / 1000,
        computed_confianza: computedConfianza,
        sources: [...new Set(ragChunks.map((c) => c.source))],
      },
    });

  } catch (error: any) {
    console.error("NEXUS_CRITICAL_ERROR:", error);
    return NextResponse.json({ error: "SWARM_ERROR", details: error?.message }, { status: 500 });
  }
}
