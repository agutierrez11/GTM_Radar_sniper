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
    const { brief, empresa_supabase, benchmark, competidores } = body;

    const prompt = `
Eres el NEXUS ARCHITECT — sistema de inteligencia GTM especializado en el ecosistema Fintech y Pagos de Latam.

REGLAS DE INTELIGENCIA ACTUALIZADAS (Reportes VISA/The Paypers 2026):
- AGENTIC COMMERCE: Identifica oportunidades donde la IA toma decisiones de pago autónomas (Inventory-to-Order).
- PIX/SPEI DOMINANCE: Prioriza estrategias de Pagos Cuenta-a-Cuenta (A2A) sobre tarjetas tradicionales si el país es Brasil o México.
- CROSS-BORDER FRICTIONLESS: Detecta cuellos de botella en pagos transfronterizos y sugiere orquestación moderna.
- REGLA ANTI-SESGO Y RAZONAMIENTO PROFUNDO:
  - Ejecuta un ANALISIS DE PRIMEROS PRINCIPIOS antes de generar el JSON.
- Analiza SOLO con los datos proporcionados.
- Si no tienes dato real en los bloques de SUPABASE o BENCHMARK → escribe [REQUIERE SNIPER RESEARCH].
- NUNCA inventes diagnósticos operativos ni planes de flanqueo sin evidencia.
- Si los datos son insuficientes, PRIORIZA identificar la URL oficial y sugiere realizar un 'Sniper Discovery' manual.
- Marca nivel de confianza: CONFIRMADO (Datos Supabase o LatamFintech Hub) / INFERIDO (IA Knowledge + Patrones de Mercado) / PENDIENTE (Sin datos)

BRIEF GTM:
- Empresa consultante: \${brief.empresa}
- Producto/Servicio: \${brief.producto}
- País objetivo: \${brief.pais}
- Vertical objetivo: \${brief.vertical}
- Buyer persona: \${brief.buyer || "no especificado"}
- Tier de deal: \${brief.tier}
- Competidor URL: \${brief.url_competidor || "no proporcionado"}
- Cliente ideal URL: \${brief.url_cliente_ideal || "no proporcionado"}

DATOS DE SUPABASE (empresas_v2):
\${empresa_supabase ? JSON.stringify(empresa_supabase, null, 2) : "No encontrada en base de datos"}

BENCHMARK (empresas similares):
\${(benchmark?.length ?? 0) > 0 ? benchmark?.map((b: any) => b.empresa_similar).join(", ") : "Sin datos"}

COMPETIDORES EN MISMA VERTICAL:
\${(competidores?.length ?? 0) > 0 ? competidores?.map((c: any) => c.name).join(", ") : "Sin datos"}

Genera el análisis completo. Responde SOLO con JSON válido:
{
  "empresa": "\${brief.empresa}",
  "tier": "\${brief.tier}",
  "icp_score": <número 0-100>,
  "latido_mercado": "<señal reciente del mercado o [PENDIENTE - sin datos en tiempo real]>",
  "diagnostico": {
    "resfriado": "<situación operativa actual con nivel de confianza>",
    "gripe": "<riesgo inminente detectado o [PENDIENTE]>",
    "panuelo": "<solución específica que resuelve el riesgo>"
  },
  "plan_ataque": {
    "schwerpunkt": "<el centro de gravedad táctico — persona o área específica>",
    "flanqueo": "<estrategia de entrada lateral basada en Tech Stack, Operaciones o Vacíos del competidor, NO por precio>",
    "apertura": "<mensaje de apertura quirúrgico de alto impacto basado en el 'Gripe' detectado>"
  },
  "auditoria": {
    "abogado_diablo": "<razón principal por la que esta cuenta podría NO ser buena>",
    "sesgo": "<qué estás asumiendo sin evidencia directa>",
    "confianza": "<ALTO|MEDIO|BAJO según cantidad de datos reales disponibles>"
  },
  "similares": ["empresa1", "empresa2", "empresa3"],
  "competidores": ["comp1", "comp2", "comp3"],
  "discovery_mode": \${!empresa_supabase && (!competidores || competidores.length === 0) ? "true" : "false"},
  "markdown": "<ficha completa en formato Markdown para Obsidian>"
}

El campo "markdown" debe ser una ficha completa con:
# {empresa}
## 💓 Latido del Mercado
## 🔬 Diagnóstico Nexus
## ⚔️ Plan de Ataque (con \${brief.tier === "Tier1" ? "MEDDICII" : brief.tier === "Tier2" ? "SPIN" : "BANT"})
## 🌊 Océano Azul
## 🧠 Auditoría RaiSE
`;

    // MOTOR GROQ DIRECTO
    try {
      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2000,
            response_format: { type: "json_object" }
          })
        }
      );

      const groqData = await groqResponse.json();
      
      if (!groqResponse.ok) {
        throw new Error(groqData.error?.message || "Error en Groq API");
      }

      const text = groqData.choices[0].message.content;
      const data = JSON.parse(text);

      return NextResponse.json({ ...data, logId: null, cached: false });
    } catch (genError: any) {
      console.error("GENERATION_FAILED:", genError);
      return NextResponse.json(
        { 
          error: "GENERATION_ERROR",
          message: genError?.message || "Error en la generación con Groq.",
          manual_prompt: prompt
        },
        { status: 500 }
      );
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
