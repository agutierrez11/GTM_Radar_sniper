import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "../../../lib/gemini";
import { generateWithClaude } from "../../../lib/claude";
import { generateWithGroq } from "../../../lib/groq";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log(`NEXUS_API_DEPLOY_VERSION: 1.6.0 - SWARM_RAG_V3.1`);
  try {
    const body = await req.json();
    const { brief, empresa_supabase, competidores } = body;

    // --- FASE 0: RAG (Retrieval Augmented Generation) ---
    let ragContext = "No document evidence found in Knowledge Base.";
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1!);
      const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
      
      const queryText = `${brief.empresa} ${brief.producto} ${brief.vertical} ${brief.pais}`;
      const embedResult = await embedModel.embedContent(queryText);
      const embedding = embedResult.embedding.values;

      const { data: knowledge, error: ragError } = await (await import("../../../lib/supabase")).supabase
        .rpc("match_knowledge", {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 3,
        });

      if (!ragError && knowledge && knowledge.length > 0) {
        ragContext = knowledge.map((k: any) => k.content).join("\n---\n");
        console.log("[RAG HIT] Successfully injected context from Knowledge Base.");
      }
    } catch (ragErr) {
      console.warn("[RAG WARN] Retrieval failed, proceeding with baseline data:", ragErr);
    }

    // --- AGENTE 1: EL COSECHADOR (Facts & Signals) ---
    const harvesterPrompt = `
      Eres el AGENTE COSECHADOR de NERV.
      Tu misión: Extraer señales forenses puras de estos datos:
      
      DATOS ESTRUCTURADOS: ${JSON.stringify({ brief, empresa_supabase, competidores })}
      EVIDENCIA DOCUMENTAL (RAG): ${ragContext}
      
      Reglas:
      1. Identifica el dolor técnico de la PRESA (${brief.vertical} en ${brief.pais}).
      2. PRIORIZA la EVIDENCIA DOCUMENTAL (RAG) si está disponible.
      Responde con una lista de 5 hechos brutales. No hables, solo los hechos.
    `;
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

      Tu misión: Generar el Dossier Forense Final que resuelva el debate anterior.
      Sigue el protocolo RaiSE v3.1: Inferencia -> Fricción -> Resolución.

      ESTRUCTURA JSON:
      {
        "empresa": "${brief.empresa}",
        "tier": "${brief.tier}",
        "icp_score": <int>,
        "latido_mercado": "<Trigger real>",
        "analisis_forense": {
          "inferencia_raise": "<Cómo el enjambre resolvió el debate entre hechos y objeciones>",
          "friccion_tecnica": "<El cuello de botella real tras el análisis crítico>",
          "dolor_financiero": "<Costo de inacción>"
        },
        "diagnostico": {
          "friccion_operativa": "...",
          "dolor_critico": "...",
          "resolucion_tactica": "..."
        },
        "plan_ataque": {
          "schwerpunkt": "...",
          "flanqueo": "<Basado en superar las objeciones del Red Team>",
          "apertura": "..."
        },
        "auditoria": {
          "confianza": "ALTO",
          "resumen_enjambre": "<Breve resumen de la discusión entre agentes>"
        },
        "markdown": "..."
      }
    `;

    const gResp = await generateWithFallback(finalPrompt);
    return NextResponse.json({ ...gResp.data, logId: null, cached: false, swarm_mode: true });

  } catch (error: any) {
    console.error("NEXUS_CRITICAL_ERROR:", error);
    return NextResponse.json({ error: "SWARM_ERROR", details: error?.message }, { status: 500 });
  }
}
