import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleaned));
  } catch (error) {
    console.error("Smart Parser Error:", error);
    return NextResponse.json({ error: "Error parsing prompt" }, { status: 500 });
  }
}
