import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "../../../lib/gemini";
import { generateWithClaude } from "../../../lib/claude";
import { generateWithGroq } from "../../../lib/groq";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log(`NEXUS_API_DEPLOY_VERSION: 1.4.0 - CLAUDE_READY - RESILIENT_MODE`);
  try {
    const body = await req.json();
    console.log("NEXUS_REQUEST_BODY:", JSON.stringify(body, null, 2));
    const { brief, empresa_supabase, benchmark, competidores, clientes_potenciales } = body;

    const prompt = `
Eres NERV — el sistema nervioso de inteligencia GTM especializado en el ecosistema Fintech y Pagos de Latam.
Tu misión es diseccionar empresas y generar estrategias de ataque quirúrgicas. 2026):
- AGENTIC COMMERCE: Identifica oportunidades donde la IA toma decisiones de pago autónomas (Inventory-to-Order).
- PIX/SPEI DOMINANCE: Prioriza estrategias de Pagos Cuenta-a-Cuenta (A2A) sobre tarjetas tradicionales si el país es Brasil o México.
- CROSS-BORDER FRICTIONLESS: Detecta cuellos de botella en pagos transfronterizos y sugiere orquestación moderna.
- REGLA ANTI-SESGO Y RAZONAMIENTO PROFUNDO:
  - Ejecuta un ANALISIS DE PRIMEROS PRINCIPIOS antes de generar el JSON.
- Analiza SOLO con los datos proporcionados.
- NUNCA inventes diagnósticos operativos ni planes de flanqueo sin evidencia.
- Si no hay competidores disponibles, deja el array vacío [].
- Marca nivel de confianza: CONFIRMADO (Datos Supabase o LatamFintech Hub) / INFERIDO (IA Knowledge + Patrones de Mercado) / PENDIENTE (Sin datos)

BRIEF GTM:
- Empresa consultante: ${brief.empresa}
- Producto/Servicio: ${brief.producto}
- País objetivo: ${brief.pais}
- Vertical objetivo: ${brief.vertical}
- Buyer persona: ${brief.buyer || "no especificado"}
- Tier de deal: ${brief.tier}
- Competidor URL: ${brief.url_competidor || "no proporcionado"}
- Cliente ideal URL: ${brief.url_cliente_ideal || "no proporcionado"}

DATOS DE SUPABASE (empresas_v2):
${empresa_supabase ? JSON.stringify(empresa_supabase, null, 2) : "No encontrada en base de datos"}

BENCHMARK (empresas similares):
${(benchmark?.length ?? 0) > 0 ? benchmark?.map((b: any) => b.empresa_similar).join(", ") : "Sin datos"}

SEÑALES DE MERCADO DINÁMICAS (Recientes):
${benchmark?.length > 0 ? benchmark.slice(0, 3).map((b: any) => `- ${b.empresa_similar}: [SEÑAL EN DB]`).join('\n') : "Buscando señales frescas..."}

INSTRUCCIÓN CRÍTICA DE REFERENCIA:
- Cada punto de "evidencia" DEBE incluir una URL real (si está disponible en los datos de Supabase).
- No divagues. Si no hay link, indica el origen (ej. Supabase DB).

COMPETIDORES REALES DIRECTOS (Empresas que venden lo mismo que ${brief.empresa}):
${(competidores?.length ?? 0) > 0 ? JSON.stringify(competidores, null, 2) : "[]"}

CUENTAS OBJETIVO / CLIENTES POTENCIALES (A quiénes queremos vender):
${(clientes_potenciales?.length ?? 0) > 0 ? JSON.stringify(clientes_potenciales, null, 2) : "Sin leads detectados"}

Genera el análisis completo. Responde SOLO con JSON válido:
{
  "empresa": "${brief.empresa}",
  "tier": "${brief.tier}",
  "icp_score": <número 0-100>,
  "latido_mercado": "<señal reciente del mercado o [PENDIENTE - sin datos en tiempo real]>",
  "diagnostico": {
    "resfriado": "<situación operativa actual con nivel de confianza>",
    "gripe": "<riesgo inminente detectado o [PENDIENTE]>",
    "panuelo": "<solución específica que resuelve el riesgo para sus clientes>"
  },
  "plan_ataque": {
    "schwerpunkt": "<el centro de gravedad táctico — persona o área específica a contactar>",
    "flanqueo": "<estrategia de entrada lateral ATACANDO DEBILIDADES de los COMPETIDORES REALES para ganar la cuenta de los CLIENTES POTENCIALES, NO por precio>",
    "apertura": "<mensaje de apertura quirúrgico de alto impacto para enviarle a uno de los CLIENTES POTENCIALES, usando el flanqueo anterior>"
  },
  "auditoria": {
    "abogado_diablo": "<razón principal por la que esta cuenta podría NO ser buena>",
    "sesgo": "<qué estás asumiendo sin evidencia directa>",
    "confianza": "<ALTO|MEDIO|BAJO según cantidad de datos reales disponibles>"
  },
  "similares": ["empresa1", "empresa2", "empresa3"],
  "competidores": ${JSON.stringify(competidores?.slice(0, 8) || [])},
  "clientes_potenciales": ${JSON.stringify(clientes_potenciales?.slice(0, 8) || [])},
  "evidencia": ["Fuente 1", "Fuente 2"],
  "discovery_mode": ${!empresa_supabase && (!clientes_potenciales || clientes_potenciales.length === 0) ? "true" : "false"},
  "markdown": "<ficha completa en formato Markdown para Obsidian>"
}

El campo "markdown" debe ser una ficha completa con:
# {empresa}
## 💓 Latido del Mercado
## 🔬 Diagnóstico Nexus
## ⚔️ Plan de Ataque (con ${brief.tier === "Tier1" ? "MEDDICII" : brief.tier === "Tier2" ? "SPIN" : "BANT"})
## 🌊 Océano Azul
## 🧠 Auditoría RaiSE
`;

    // MOTOR GEMINI (Native Resilience Library - v2.0 Flash)
    try {
      const gResp = await generateWithFallback(prompt);
      const data = gResp.data;
      return NextResponse.json({ ...data, logId: null, cached: gResp.cached });
    } catch (genError: any) {
      console.error("GEMINI_GENERATION_FAILED:", genError);
      console.warn("Iniciando Fallback a Groq (Llama 3.3)...");
      try {
        const groqData = await generateWithGroq(prompt);
        return NextResponse.json({ ...groqData, logId: null, cached: false, provider: "groq" });
      } catch (groqError: any) {
        console.error("GROQ_GENERATION_FAILED:", groqError);
        return NextResponse.json(
          { 
            error: "GENERATION_ERROR",
            message: genError?.message || "Error en la generación con Gemini y el fallback de Groq falló.",
            manual_prompt: prompt
          },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error("NEXUS_CRITICAL_ERROR:", error);
    return NextResponse.json(
      { 
        error: "CRITICAL_ERROR",
        details: error?.message || "Error desconocido en el servidor"
      },
      { status: 500 }
    );
  }
}
