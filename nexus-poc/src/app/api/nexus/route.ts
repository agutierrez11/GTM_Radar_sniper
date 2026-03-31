import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "../../../lib/gemini";
import { generateWithClaude } from "../../../lib/claude";
import { generateWithDeepSeek } from "../../../lib/deepseek";
import { generateWithGroq } from "../../../lib/groq";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log(`NEXUS_API_DEPLOY_VERSION: 1.5.0 - RATE_LIMIT_ACTIVE`);
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";

  try {
    const body = await req.json();
    const { brief, empresa_supabase, is_minimal, is_surgical } = body;

    // 🛡️ EMERGENCY RATE LIMIT (3 per IP per 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    try {
      const { count, error: countError } = await supabase
        .from("logs_busquedas")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", ip)
        .gte("created_at", yesterday);

      if (!countError && count !== null && count >= 3) {
        return NextResponse.json(
          { 
            error: "RATE_LIMIT_EXCEEDED",
            message: "Has alcanzado el límite de consultas gratuitas. Escríbenos a hi@woad.ai para acceso completo."
          },
          { status: 429 }
        );
      }
    } catch (e) {
      console.warn("Rate limit check failed (table might be missing), bypassing for now...");
    }

    const prompt = is_surgical 
      ? `
Eres NERV — en modo SURGICAL STRIKE (ABM).
Tu misión es diseñar un plan de ataque táctico de ${brief.empresa} contra ${brief.target_account}.

OBJETIVO:
1. Usa Google Search para encontrar los "puntos de dolor" actuales, noticias financieras o movimientos estratégicos de ${brief.target_account} en las últimas 4 semanas.
2. Cruza esos dolores con el producto de ${brief.empresa} (${brief.producto}).
3. Define el "Diagnóstico" (Problema detectado en ${brief.target_account}) y el "Riesgo" (consecuencia real).
4. Escribe una "Apertura" que sea imposible de ignorar para un C-Level de ${brief.target_account}.

REGLA DE ORO:
- Cero generalidades. Habla de DATOS REALES encontrados en la búsqueda de ${brief.target_account}.
- El mensaje debe ser: "Vi que [Señal Real] y por eso ${brief.empresa} puede [Solución]".

Llama a 'generarDiagnosticoGTM' con los resultados.
`
      : `
Eres NERV — el sistema nervioso de inteligencia GTM especializado en el ecosistema Fintech y Pagos de Latam.
Tu única misión es ser el CO-PILOTO de GTM de ${brief.empresa}.

INFERENCIA (Novedad):
- NERV conoce a 2,500+ empresas del ecosistema Latam. Si el usuario no da país o vertical, tú los infieres desde el nombre: ${brief.empresa}.
- Si es una empresa nueva fuera del radar, búscala primero en Google a través de Search.

ROLES:
- empresa_usuario: ${brief.empresa} — es SIEMPRE quien VENDE / usa NERV.
- producto_usuario: ${brief.producto} — lo que vende ${brief.empresa}.
- Etapa del deal: ${brief.tier}

Llama a 'generarDiagnosticoGTM' con los resultados.
`;

    // PHASE 1: EXPLORADOR (GEMINI TOOL COMBINATION)
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_PROFESSIONAL || process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }, { apiVersion: "v1beta" });

      const tools = [
        { googleSearch: {} },
        {
          functionDeclarations: [{
            name: "generarDiagnosticoGTM",
            description: "Genera el diagnóstico estratégico y plan de ataque basado en datos reales.",
            parameters: {
              type: "OBJECT",
              properties: {
                latido_mercado: { type: "STRING" },
                diagnostico: {
                  type: "OBJECT",
                  properties: {
                    resfriado: { type: "STRING" },
                    gripe: { type: "STRING" },
                    panuelo: { type: "STRING" }
                  }
                },
                plan_ataque: {
                  type: "OBJECT",
                  properties: {
                    schwerpunkt: { type: "STRING" },
                    flanqueo: { type: "STRING" },
                    apertura: { type: "STRING" }
                  }
                },
                evidencia: { type: "ARRAY", items: { type: "STRING" } },
                icp_score: { type: "NUMBER" },
                similares: { type: "ARRAY", items: { type: "STRING" } }
              },
              required: ["latido_mercado", "diagnostico", "plan_ataque", "evidencia", "icp_score"]
            }
          }]
        }
      ];

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools,
        toolConfig: { includeServerSideToolInvocations: true }
      });

      const parts = result.response.candidates[0].content.parts;
      const functionCallPart = parts.find((p: any) => p.functionCall);
      
      let data: any = {};
      if (functionCallPart) {
        data = functionCallPart.functionCall.args;
      } else {
        const text = parts.map((p: any) => p.text).join("");
        const cleaned = text.replace(/```json\n?|```/g, "").trim();
        try { data = JSON.parse(cleaned); } catch (e) { data = { markdown: text }; }
      }

      // Final Response
      const finalResponse = {
        ...data,
        empresa: brief.empresa,
        tier: brief.tier,
        markdown: data.markdown || `# ${brief.empresa} - Plan de Ataque\n\n${data.latido_mercado || ""}`
      };

      // 📝 LOG THE SEARCH
      try {
        await supabase.from("logs_busquedas").insert({
          ip_address: ip,
          empresa_atacar: brief.empresa,
          producto_vendedor: brief.producto,
          tier: brief.tier,
          data_result: finalResponse
        });
      } catch (logErr) {
        console.warn("Logging failed:", logErr);
      }

      return NextResponse.json(finalResponse);
    } catch (genError: any) {
      console.error("GENERATION_FAILED:", genError);
      return NextResponse.json({ error: "GENERATION_ERROR", message: genError.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "CRITICAL_ERROR", details: error.message }, { status: 500 });
  }
}
