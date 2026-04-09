import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "../../../lib/gemini";

export const dynamic = "force-dynamic";

// ── STRATEGIC NODE ROUTER (MemPalace / KB Intelligence Injection) ────────
// Lee el nodo estratégico del knowledge_base si existe para la empresa target.
// Si existe: inyecta "verdad absoluta" al Sintetizador — prohíbe alucinaciones.
async function getStrategicIntelligence(targetName: string, supabaseClient: any) {
  try {
    const { data: nodes } = await supabaseClient
      .from("knowledge_base")
      .select("content, metadata")
      .ilike("metadata->>source", `%${targetName}%`)
      .limit(3);

    if (!nodes || nodes.length === 0) return null;

    const combined = nodes.map((n: any) => n.content).join("\n");

    return {
      dolor:      combined.match(/Dolor:\s*(.*)/i)?.[1]?.trim()      || null,
      debilidad:  combined.match(/Debilidad:\s*(.*)/i)?.[1]?.trim()  || null,
      victoria:   combined.match(/Victoria:\s*(.*)/i)?.[1]?.trim()   || null,
      solucion:   combined.match(/Solución:\s*\[\[(.*?)\]\]/i)?.[1]?.trim() || null,
      raw:        combined.slice(0, 800),
    };
  } catch { return null; }
}

// ── MEMPALACE RESOLVER (Relational Context) ──────────────────────────────
// Resuelve el nodo de MemPalace + backlinks relacionales.
// Usa graceful degradation: si la tabla no existe, retorna null silenciosamente.
async function resolveMemPalaceNode(nodeName: string, supabaseClient: any) {
  try {
    const { data: mainNode, error } = await supabaseClient
      .from("mempalace_nodes")
      .select("id, title, content, node_type, tags")
      .ilike("title", `%${nodeName}%`)
      .limit(1)
      .maybeSingle();

    if (error || !mainNode) return null;

    const { data: relations } = await supabaseClient
      .rpc("get_node_connections", { target_id: mainNode.id })
      .limit(5);

    let palaceContext = `## Nodo MemPalace: ${mainNode.title}\n${mainNode.content}\n`;
    if (relations && relations.length > 0) {
      palaceContext += `\n### Conexiones Estratégicas:\n`;
      relations.forEach((rel: any) => {
        palaceContext += `- [[${rel.connected_node_title}]]: ${rel.context_of_mention}\n`;
      });
    }
    return palaceContext;
  } catch { return null; }
}

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
      // Si Google APIs están pausadas, saltamos el RAG — los 3 agentes siguen funcionando
      if (process.env.GOOGLE_APIS_PAUSED === "true") {
        console.log("[RAG SKIP] GOOGLE_APIS_PAUSED=true — continuando sin contexto documental");
        throw new Error("GOOGLE_APIS_PAUSED");
      }
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const api_key =
        process.env.GEMINI_API_KEY_PROFESSIONAL ||
        process.env.GEMINI_API_KEY_1 ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(api_key!);
      const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

      const queryText = `${brief.empresa} ${brief.producto} ${brief.vertical} ${brief.pais}`;
      const embedResult = await embedModel.embedContent({ content: { parts: [{ text: queryText }] }, taskType: 'RETRIEVAL_QUERY', outputDimensionality: 768 } as any);
      const rawEmbedding = Array.from(embedResult.embedding.values);
      const norm = Math.sqrt(rawEmbedding.reduce((s: number, v: number) => s + v * v, 0));
      const embedding = norm > 0 ? rawEmbedding.map((v: number) => v / norm) : rawEmbedding;

      const { data: knowledge, error: ragError } = await (await import("../../../lib/supabase")).supabase
        .rpc("match_kb", {
          query_embedding: embedding,
          match_threshold: 0.3,
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

    // --- FASE 2.5: STRATEGIC NODE ROUTER + MEMPALACE ─────────────────────
    // Lee nodo estratégico del KB y MemPalace para inyectar "verdad absoluta"
    const { supabase: supabaseClient } = await import("../../../lib/supabase");
    const [strategicIntel, palaceContext] = await Promise.all([
      getStrategicIntelligence(brief.empresa, supabaseClient),
      resolveMemPalaceNode(brief.empresa, supabaseClient),
    ]);

    const masterIntelBlock = strategicIntel
      ? `
⚡ INTELIGENCIA MAESTRA — VERDAD ABSOLUTA (prioridad sobre cualquier inferencia):
  Empresa: ${brief.empresa}
  ${strategicIntel.dolor ? `Dolor Crítico Documentado: ${strategicIntel.dolor}` : ""}
  ${strategicIntel.debilidad ? `Debilidad Verificada: ${strategicIntel.debilidad}` : ""}
  ${strategicIntel.victoria ? `Estrategia de Victoria: ${strategicIntel.victoria}` : ""}
  ${strategicIntel.solucion ? `Solución Sugerida: ${strategicIntel.solucion}` : ""}
  ${strategicIntel.raw ? `Contexto KB:\n${strategicIntel.raw}` : ""}
  ${palaceContext ? `\nContexto MemPalace:\n${palaceContext}` : ""}
PROHIBIDO: Alucinar o usar datos genéricos si este nodo existe. Usa SOLO esta inteligencia.`
      : "";

    // --- AGENTE 3: EL SINTETIZADOR (RaiSE v3.1) ---
    const finalPrompt = `
      Eres el SINTETIZADOR ESTRATÉGICO de NERV (v5.5).
      Tienes:
      1. Datos Crudos: ${JSON.stringify(brief)}
      2. Hechos Forenses: ${JSON.stringify(facts)}
      3. Crítica del Red Team: ${JSON.stringify(objections)}
      4. Prospectos: ${JSON.stringify(clientes_potenciales || [])}
      5. Evidencia RAG: ${ragContext}
      ${masterIntelBlock}

      Tu misión: Generar el Dossier Forense Final. Sigue el protocolo RaiSE v3.1.
      REGLAS CRÍTICAS:
      - similares: DEBES generar 3-5 nombres REALES de empresas similares a ${brief.empresa} en ${brief.vertical}
      - markdown: DEBES generar un resumen ejecutivo completo en formato Markdown (mínimo 300 palabras)
      - TODOS los campos del JSON deben tener contenido real — NUNCA dejar "...", "string vacío" o placeholder
      - icp_score: número entero 0-100 basado en fit con ${brief.vertical} en ${brief.pais}
      - apertura: línea exacta, lista para usar en email/LinkedIn, personalizada para ${brief.empresa}

      RESPONDE ÚNICAMENTE CON JSON VÁLIDO — sin markdown code blocks, sin texto antes o después:
      {
        "empresa": "${brief.empresa}",
        "tier": "${brief.tier}",
        "icp_score": <número entero 0-100>,
        "latido_mercado": "<señal de mercado real y específica para ${brief.empresa} ahora mismo>",
        "analisis_forense": {
          "inferencia_raise": "<hipótesis forense deducida del comportamiento observable de la empresa — mínimo 2 oraciones>",
          "friccion_tecnica": "<problema técnico específico que enfrenta ${brief.empresa} con ${brief.producto}>",
          "dolor_financiero": "<impacto en revenue o costos — cuantificado si es posible>"
        },
        "diagnostico": {
          "friccion_operativa": "<proceso roto o ineficiente en ${brief.empresa} que ${brief.producto} puede resolver>",
          "dolor_critico": "<el dolor #1 que hace que este deal sea urgente para ${brief.empresa}>",
          "resolucion_tactica": "<cómo ${brief.producto} resuelve ese dolor — paso a paso>"
        },
        "plan_ataque": {
          "schwerpunkt": "<punto de ruptura estratégico — el ángulo donde concentrar toda la energía>",
          "flanqueo": "<ruta alternativa si el decision maker principal bloquea el deal>",
          "apertura": "<línea exacta lista para copiar/pegar en email o LinkedIn a ${brief.empresa} — personalizada, no genérica>"
        },
        "auditoria": {
          "abogado_diablo": "<la objeción más devastadora del Red Team en una línea>",
          "sesgo": "<sesgo detectado en este análisis — sé honesto>",
          "confianza": "ALTO | MEDIO | BAJO"
        },
        "similares": ["<empresa similar 1 real>", "<empresa similar 2 real>", "<empresa similar 3 real>"],
        "competidores": ${JSON.stringify(competidores || [])},
        "clientes_potenciales": ${JSON.stringify(clientes_potenciales || [])},
        "markdown": "# Dossier Forense: ${brief.empresa}\\n\\n## Situación de Mercado\\n<análisis de mercado>\\n\\n## Diagnóstico Estratégico\\n<diagnóstico>\\n\\n## Plan de Ataque\\n<plan>\\n\\n## Auditoría de Calidad\\n<auditoría>"
        ${isVendorMode ? `,
        "vendor_attack": {
          "arma": "<UVP del vendedor en máximo 20 palabras>",
          "dolor": "<el dolor específico del target que mejor encaja con la UVP>",
          "sutura": "<cómo el vendedor resuelve ese dolor paso a paso>",
          "apertura_recomendada": "<línea exacta de apertura para el primer contacto con el target>"
        }` : ""}
      }
    `;

    const gResp = await generateWithFallback(finalPrompt);

    // --- JSON RECOVERY: si Gemini devolvió texto plano en lugar de JSON ---
    // generateWithFallback hace fallback a string cuando JSON.parse falla.
    // Si synthOutput es string, intentar extraer el bloque JSON antes de continuar.
    // Sin esto, el spread `...synthOutput` genera claves numéricas y todos los campos anidados quedan undefined.
    let synthRaw = gResp.data ?? {};
    if (typeof synthRaw === "string") {
      try {
        const jsonMatch = (synthRaw as string).match(/\{[\s\S]*\}/);
        if (jsonMatch) synthRaw = JSON.parse(jsonMatch[0]);
        else synthRaw = {};
      } catch {
        synthRaw = {};
      }
    }

    // --- METACOGNICIÓN DETERMINISTA ---
    // Confianza calculada desde RAG similarity scores — no es opinión del LLM.
    // El LLM genera auditoria.confianza subjetivo; este bloque lo sobreescribe con matemática real.
    const synthOutput = synthRaw;
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
