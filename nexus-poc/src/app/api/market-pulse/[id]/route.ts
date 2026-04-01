// src/app/api/market-pulse/[id]/route.ts
// Latido del Mercado — NERV
// Env vars: GEMINI_API_KEY_PROFESSIONAL (fallback: GEMINI_API_KEY_1)
// DB: SUPABASE_SERVICE_ROLE_KEY (igual que scripts del Enjambre)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const apiKeys = [
  process.env.GEMINI_API_KEY_PROFESSIONAL, 
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  process.env.GEMINI_API_KEY,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log("MARKET_PULSE_REQUEST_ID:", id);

  const { data: empresa, error } = await supabase
    .from('empresas_v2')
    .select(`
      id, name, country, city,
      segment_latamfintech, product_category,
      competitors_verified, funding_stage,
      total_raised, markets_latam,
      strategic_notes, signal_context
    `)
    .eq('id', parseInt(id))
    .single()

  if (error) {
    console.error("SUPABASE_LOOKUP_ERROR:", error);
    return NextResponse.json({ error: 'Empresa no encontrada', detail: error.message }, { status: 404 })
  }

  if (!empresa) {
    console.warn("NO_COMPANY_FOUND_FOR_ID:", id);
    return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
  }

  if (empresa.signal_context?.generated_at) {
    const age = Date.now() - new Date(empresa.signal_context.generated_at).getTime()
    if (age < 24 * 60 * 60 * 1000) {
      return NextResponse.json({
        success: true,
        signal_context: empresa.signal_context,
        cached: true
      })
    }
  }

  const competidores = Array.isArray(empresa.competitors_verified)
    ? empresa.competitors_verified.join(', ')
    : 'No identificados'

  const mercados = Array.isArray(empresa.markets_latam)
    ? empresa.markets_latam.join(', ')
    : empresa.country || 'LATAM'

  const prompt = `
Eres un analista de inteligencia de mercado especializado en fintech latinoamericano.

Empresa: ${empresa.name}
Segmento: ${empresa.segment_latamfintech || empresa.product_category || 'Fintech'}
Mercados: ${mercados}
Funding stage: ${empresa.funding_stage || 'N/A'}
Total raised: ${empresa.total_raised || 'N/A'}
Competidores verificados: ${competidores}
${empresa.strategic_notes ? `Notas estratégicas: ${empresa.strategic_notes}` : ''}

Usa Google Search para encontrar señales de mercado de las últimas 4 semanas relevantes para ${empresa.name} y su sector en ${mercados}.

Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional:
{
  "headline": "Una frase de máximo 15 palabras que capture la señal más importante ahora mismo",
  "signals": [
    "Señal 1 concreta con dato verificable (máx 20 palabras)",
    "Señal 2 concreta con dato verificable (máx 20 palabras)",
    "Señal 3 concreta con dato verificable (máx 20 palabras)"
  ],
  "sentiment": "bullish",
  "sources": [
    {"title": "Título de fuente real", "url": "https://url-real.com"},
    {"title": "Título de fuente real", "url": "https://url-real.com"}
  ],
  "generated_at": "${new Date().toISOString()}"
}

sentiment debe ser exactamente: "bullish", "bearish", o "neutral".
Solo información encontrada en la búsqueda. No inventes datos.
`

  let lastError: any = null;
  
  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[(currentKeyIndex + i) % apiKeys.length];
    const genAI = new GoogleGenerativeAI(key);
    
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      }, { apiVersion: 'v1beta' })

    const tools = [
      { googleSearch: {} },
      {
        functionDeclarations: [{
          name: "guardarSeñales",
          description: "Guarda las señales de mercado estructuradas de la empresa.",
          parameters: {
            type: "OBJECT",
            properties: {
              headline: { type: "STRING", description: "Señal principal en máx 15 palabras" },
              signals: { type: "ARRAY", items: { type: "STRING" }, description: "3 señales concretas verificables" },
              sentiment: { type: "STRING", description: "bullish, bearish o neutral" },
              sources: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    url: { type: "STRING" }
                  }
                }
              }
            },
            required: ["headline", "signals", "sentiment", "sources"]
          }
        }]
      }
    ] as any

    const toolConfig = { includeServerSideToolInvocations: true } as any

    // Turn 1: Gemini busca en Google Y llama guardarSeñales
    const result1 = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools,
      toolConfig,
      generationConfig: { temperature: 0.2 }
    })

    const parts1 = result1.response.candidates![0].content.parts
    const functionCallPart = parts1.find((p: any) => p.functionCall)

    let signalContext: any

    if (functionCallPart?.functionCall) {
      const { args, id: fcId, name } = functionCallPart.functionCall as any
      signalContext = args

      // Turn 2: devolver el resultado de la función con context circulation
      await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: prompt }] },
          result1.response.candidates![0].content,
          {
            role: 'user',
            parts: [{
              functionResponse: {
                name,
                response: { status: 'saved', empresa: empresa.name },
                id: fcId
              } as any
            }]
          }
        ],
        tools,
        toolConfig,
        generationConfig: { temperature: 0.2 }
      })
    } else {
      // Fallback: parsear texto si no hubo function call
      const rawText = parts1.filter((p: any) => p.text).map((p: any) => p.text).join('')
      const cleaned = rawText.replace(/```json|```/g, '').trim()
      signalContext = JSON.parse(cleaned)
    }

    signalContext.generated_at = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('empresas_v2')
      .update({ signal_context: signalContext })
      .eq('id', parseInt(id))

    if (updateError) console.error('Error guardando signal_context:', updateError)

      currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
      return NextResponse.json({ success: true, signal_context: signalContext, cached: false })

    } catch (err: any) {
      console.error(`Error Gemini market-pulse with key ${i}:`, err);
      lastError = err;
      // Si el error es de cuota o 429, seguimos al siguiente loop
      if (err?.status === 429 || err?.message?.includes("429")) {
        continue;
      }
      // Otros errores (como modelo no encontrado) también rotamos
      if (err?.status === 404 || err?.message?.includes("404")) {
        continue;
      }
      break; // Errores fatales paramos
    }
  }

  return NextResponse.json(
    { error: 'Error generando Latido del Mercado tras agotar pool de llaves', detail: lastError?.message },
    { status: 500 }
  );
}
