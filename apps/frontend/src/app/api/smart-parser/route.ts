import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

function geminiKey() {
  return (
    process.env.GEMINI_API_KEY_PROFESSIONAL ||
    process.env.GEMINI_API_KEY_1 ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    ""
  );
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const systemPrompt = `
Eres el PARSER TÁCTICO de NERV (El sistema nervioso del ecosistema Fintech Latam).
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
5. Para el 'tier', si no se especifica volumen o tamaño de deal, por defecto usa "Tier2".

TEXTO DEL USUARIO:
"${prompt}"
`;

    const key = geminiKey();
    if (!key) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no configurada (smart-parser)." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 1000,
        temperature: 0.1,
      },
    });

    try {
      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();
      const responseData = JSON.parse(text);
      return NextResponse.json({ ...responseData, cached: false });
    } catch (genError: unknown) {
      const msg = genError instanceof Error ? genError.message : String(genError);
      console.error("SMART_PARSER_GENERATION_FAILED:", genError);
      return NextResponse.json(
        { error: "Error en el procesamiento con Gemini.", details: msg },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Smart Parser Error:", error);
    return NextResponse.json(
      { error: "Sistema ocupado. Intenta en unos momentos." },
      { status: 503 }
    );
  }
}
