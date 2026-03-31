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
    const { brief, empresa_supabase, benchmark, competidores, clientes_potenciales, isForensic } = body;

    const forensicPrompt = `
Eres NERV — el sistema de inteligencia forense GTM (v5.1). 
Tu ADN es **RaiSE v2.2** (Reliable AI-assisted Software Engineering). No eres un generador de contenido; eres un sistema de inferencia.

PROTOCOLO DE RAZONAMIENTO (PASO A PASO):
1. **SNR Audit:** Filtra la data de Supabase. Descarta lo genérico.
2. **Heurística de Señal (H1):** Busca discrepancias entre triggers regulatorios y oferta actual.
3. **Inferencia Selectiva:** DEDUCE lo que no está escrito (ej: fricción por cambios en ${brief.pais}).
4. **Jidoka Audit:** Borra frases genéricas. Si no hay evidencia, marca [SÓLO INFERIDO].

IDENTIDAD DE LOS ACTORES:
- **CAZADOR (Vendedor):** ${brief.empresa}
- **ARMA (Producto):** ${brief.producto}
- **PRESA (Mercado Objetivo):** Empresas del sector **${brief.vertical}** en **${brief.pais}** (Foco: ${brief.tier}).

REGLA DE PERSPECTIVA (CRÍTICA):
- **NO analices la situación de ${brief.empresa}.** Ellos ya están bien; ellos son los que venden.
- **Analiza la FRICCIÓN de la PRESA.** ¿Qué problemas técnicos o financieros sufren las empresas de ${brief.vertical} en ${brief.pais} hoy mismo?
- Tu objetivo es identificar por qué la PRESA necesita el ARMA de ${brief.empresa} para sobrevivir.

GOBERNANZA DE DATOS: 
- Prohibido mostrar metadatos técnicos (ej: "source", "radar_co_2025"). 
- Traduce tags a "Presencia confirmada en radares 2025".

FILTROS DE EVIDENCIA (Ground Truth):
- País: ${brief.pais} (Prioriza SPEI/A2A si es MX, PIX si es BR, Ley de Open Finance si es CO).
- Vertical: ${brief.vertical} (Homologa: si es iGaming, busca regulación de juegos y apuestas; si es Pagos, busca orquestación y fraude).

ESTRUCTURA DEL DOSSIER FORENSE:
1. **Fricción Operativa (De la PRESA):** El problema técnico que sufren las empresas objetivo.
2. **Dolor Crítico (De la PRESA):** El riesgo financiero o regulatorio si no compran el ARMA.
3. **Resolución Táctica:** Cómo ${brief.empresa} (el CAZADOR) resuelve ese dolor específico.

DATOS DE SUPABASE (Empresas similares o señales):
${empresa_supabase ? JSON.stringify(empresa_supabase, null, 2) : "No encontrada en base de datos"}

COMPETIDORES REALES (A quién debe vencer ${brief.empresa}):
${(competidores?.length ?? 0) > 0 ? JSON.stringify(competidores, null, 2) : "[]"}

Genera el análisis completo. Responde SOLO con JSON válido:
{
  "empresa": "${brief.empresa}",
  "tier": "${brief.tier}",
  "icp_score": <int 0-100>,
  "latido_mercado": "<Trigger real en ${brief.pais}>",
  "analisis_forense": {
    "inferencia_raise": "<Razonamiento heurístico: Por qué deduces este dolor específico>",
    "friccion_tecnica": "<El cuello de botella operativo real>",
    "dolor_financiero": "<El costo de NO usar ${brief.producto}>"
  },
  "diagnostico": {
    "friccion_operativa": "<Situación real que sufre la PRESA en ${brief.pais}>",
    "dolor_critico": "<Riesgo financiero/legal inminente para la PRESA>",
    "resolucion_tactica": "<Inyección de ${brief.empresa} para eliminar el dolor>"
  },
  "plan_ataque": {
    "schwerpunkt": "<El tomador de decisiones en la PRESA>",
    "flanqueo": "<Cómo derrotar a competidores atacando su falta de especialización>",
    "apertura": "<Gancho directo a la yugular del dolor de la PRESA>"
  },
  "auditoria": {
    "snr_score": <int 0-100>,
    "confianza": "<ALTO|MEDIO|BAJO>",
    "sesgo": "<Qué estás asumiendo de la PRESA sin evidencia directa>"
  },
  "markdown": "<Ficha forense completa en Markdown>"
}

REGLA CRÍTICA: PROHIBIDO usar las palabras "Resfriado", "Gripe" o "Pañuelo". 
Usa EXCLUSIVAMENTE terminología de negocios y ventas estratégicas.
`;

    const genericPrompt = `
Genera un análisis de ventas genérico para ${brief.empresa} vendiendo ${brief.producto} en ${brief.pais} para el sector ${brief.vertical}.
Sé vago, usa lenguaje corporativo estándar y no profundices en datos forenses ni regulatorios.
Responde SOLO con JSON válido siguiendo esta estructura exacta:
{
  "empresa": "${brief.empresa}",
  "tier": "${brief.tier}",
  "icp_score": 75,
  "latido_mercado": "El mercado está creciendo de forma estable.",
  "diagnostico": {
    "friccion_operativa": "El mercado es competitivo y las empresas buscan digitalizarse.",
    "dolor_critico": "Necesidad de mejorar la eficiencia operativa y reducir costos.",
    "resolucion_tactica": "Usar la tecnología de ${brief.empresa} para optimizar sus procesos."
  },
  "plan_ataque": {
    "schwerpunkt": "Gerentes de IT y Finanzas",
    "flanqueo": "Resaltar que somos líderes globales y tenemos buen soporte.",
    "apertura": "Hola, ¿cómo estás? Me gustaría hablarte de nuestras soluciones de pago."
  },
  "auditoria": {
    "confianza": "ALTO",
    "abogado_diablo": "La competencia es fuerte.",
    "sesgo": "Ninguno"
  },
  "markdown": "# Análisis Genérico\nEste es un análisis estándar sin profundidad forense."
}
`;

    const finalPrompt = isForensic === false ? genericPrompt : forensicPrompt;

    try {
      const gResp = await generateWithFallback(finalPrompt);
      const data = gResp.data;
      return NextResponse.json({ ...data, logId: null, cached: gResp.cached });
    } catch (genError: any) {
      console.error("GEMINI_GENERATION_FAILED:", genError);
      console.warn("Iniciando Fallback a Groq (Llama 3.3)...");
      try {
        const groqData = await generateWithGroq(finalPrompt);
        return NextResponse.json({ ...groqData, logId: null, cached: false, provider: "groq" });
      } catch (groqError: any) {
        console.error("GROQ_GENERATION_FAILED:", groqError);
        return NextResponse.json(
          { 
            error: "GENERATION_ERROR",
            message: genError?.message || "Error en la generación con Gemini y el fallback de Groq falló.",
            manual_prompt: finalPrompt
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
