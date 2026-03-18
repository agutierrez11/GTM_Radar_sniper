import { NextRequest, NextResponse } from "next/server";
// import { generateWithFallback } from "@/lib/gemini";
import { generateWithClaude } from "@/lib/claude";
import { generateWithGroq } from "@/lib/groq";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const systemPrompt = `
Eres el PARSER TÁCTICO de Nexus Architect.
Tu misiones recibir un texto de un usuario y extraer los campos necesarios para rellenar un formulario de estrategia GTM.

JSON SCHEMA DE SALIDA:
{
  "empresa": string,
  "producto": string,
  "pais": "México" | "Colombia" | "Brasil" | "Chile" | "Argentina" | "Perú",
  "vertical": string (Debe ser una de las verticales Fintech Latam),
  "buyer": string,
  "tier": "Tier1" | "Tier2" | "Tier3",
  "es_relevante": boolean,
  "motivo_rechazo": string | null,
  "pregunta_guia": string | null
}

REGLAS DE RELEVANCIA:
- Solo acepta empresas relacionadas con: Fintech, Payments, E-commerce, SaaS, Banca, Inversiones, o GRANDES Retailers ( Liverpool, Falabella, Suburbia, Walmart).
- RECHAZA (es_relevante: false) negocios locales pequeños como "tortillerías", "estéticas", "tiendas de abarrotes" o servicios no escalables.
- Si rechazas, pon el motivo en 'motivo_rechazo'.

REGLAS DE PREGUNTA GUÍA:
- Si falta el campo 'empresa', pregunta: "¿Cuál es el nombre de la empresa que quieres analizar?"
- Si falta 'producto' o 'vertical', pregunta: "¿Qué tipo de solución o producto ofrecen?"
- Si todo está ok, deja 'pregunta_guia' como null.

REGLAS CRÍTICAS:
1. NO BUSQUES EN INTERNET.
2. NO RESPONDAS AL USUARIO. Solo devuelve el JSON.
3. Si un campo no está claro, deja el string vacío "".
4. Para el 'pais', si no se menciona un país de la lista, deja vacío.
5. Para 'tier', si no se especifica volumen o tamaño de deal, por defecto usa "Tier2".

TEXTO DEL USUARIO:
"${prompt}"
`;

    // MOTOR GROQ DIRECTO
    let responseData;
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
            messages: [{ role: "user", content: systemPrompt }],
            max_tokens: 1000,
            response_format: { type: "json_object" }
          })
        }
      );

      const groqData = await groqResponse.json();
      
      if (!groqResponse.ok) {
        throw new Error(groqData.error?.message || "Error en Groq API");
      }

      const text = groqData.choices[0].message.content;
      responseData = JSON.parse(text);

      return NextResponse.json({ ...responseData, cached: false });
    } catch (genError: any) {
      console.error("SMART_PARSER_GENERATION_FAILED:", genError);
      return NextResponse.json(
        { error: "Error en el procesamiento con Groq.", details: genError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Smart Parser Error:", error);
    return NextResponse.json(
      { error: "Sistema ocupado. Intenta en unos momentos." },
      { status: 503 }
    );
  }
}
