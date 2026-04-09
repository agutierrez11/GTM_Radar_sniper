// Latido del Mercado — NERV
// Soporta id numérico (empresas_v3 / empresas_v2) y UUID (empresas_v3 en prod).

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
].filter(Boolean) as string[]

let currentKeyIndex = 0

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type PulseTable = 'empresas_v3' | 'empresas_v2'

interface NormalizedEmpresa {
  name: string
  mercados: string
  segment: string
  competidores: string
  funding: string
  raised: string
  notes: string
  signal_context: unknown
  table: PulseTable
  rowId: string | number
}

function parseSignalCached(raw: unknown): { generated_at?: string } | null {
  if (raw == null) return null
  if (typeof raw === 'object' && raw !== null && 'generated_at' in (raw as object)) {
    return raw as { generated_at?: string }
  }
  if (typeof raw === 'string') {
    try {
      const t = JSON.parse(raw)
      return typeof t === 'object' && t && 'generated_at' in t ? t : null
    } catch {
      return null
    }
  }
  return null
}

async function loadEmpresa(idParam: string): Promise<NormalizedEmpresa | null> {
  const id = idParam.trim()
  const isUuid = UUID_RE.test(id)
  const num = /^\d+$/.test(id) ? parseInt(id, 10) : NaN

  if (!isUuid && Number.isNaN(num)) return null

  const v3sel =
    'id, nombre, pais_hq, mercados_latam, vertical, uvp, etapa_funding, total_raised_usd, competidor_1, competidor_2, competidor_3, strategic_notes, signal_context'

  const { data: v3, error: e3 } = isUuid
    ? await supabase.from('empresas_v3').select(v3sel).eq('id', id).maybeSingle()
    : await supabase.from('empresas_v3').select(v3sel).eq('id', num).maybeSingle()

  if (e3) console.error('empresas_v3 lookup:', e3.message)
  if (v3) {
    const comps = [v3.competidor_1, v3.competidor_2, v3.competidor_3].filter(Boolean).join(', ')
    const mercados = Array.isArray(v3.mercados_latam)
      ? v3.mercados_latam.join(', ')
      : v3.pais_hq || 'LATAM'
    return {
      name: v3.nombre,
      mercados,
      segment: v3.vertical || v3.uvp || 'Fintech',
      competidores: comps || 'No identificados',
      funding: v3.etapa_funding || 'N/A',
      raised: v3.total_raised_usd != null ? String(v3.total_raised_usd) : 'N/A',
      notes: v3.strategic_notes || '',
      signal_context: v3.signal_context,
      table: 'empresas_v3',
      rowId: v3.id as string | number,
    }
  }

  if (!Number.isNaN(num)) {
    const { data: v2, error: e2 } = await supabase
      .from('empresas_v2')
      .select(
        `id, name, country, city,
        segment_latamfintech, product_category,
        competitors_verified, funding_stage,
        total_raised, markets_latam,
        strategic_notes, signal_context`
      )
      .eq('id', num)
      .maybeSingle()

    if (e2) console.error('empresas_v2 lookup:', e2.message)
    if (v2) {
      const competidores = Array.isArray(v2.competitors_verified)
        ? v2.competitors_verified.join(', ')
        : 'No identificados'
      const mercados = Array.isArray(v2.markets_latam)
        ? v2.markets_latam.join(', ')
        : v2.country || 'LATAM'
      return {
        name: v2.name,
        mercados,
        segment: v2.segment_latamfintech || v2.product_category || 'Fintech',
        competidores,
        funding: v2.funding_stage || 'N/A',
        raised: v2.total_raised != null ? String(v2.total_raised) : 'N/A',
        notes: v2.strategic_notes || '',
        signal_context: v2.signal_context,
        table: 'empresas_v2',
        rowId: v2.id,
      }
    }
  }

  return null
}

async function saveSignalContext(
  table: PulseTable,
  rowId: string | number,
  signalContext: Record<string, unknown>
) {
  const payload =
    table === 'empresas_v3'
      ? { signal_context: JSON.stringify(signalContext) }
      : { signal_context: signalContext }

  const { error } = await supabase.from(table).update(payload).eq('id', rowId)
  if (error) console.error(`Error guardando signal_context (${table}):`, error.message)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log('MARKET_PULSE_REQUEST_ID:', id)

  const empresa = await loadEmpresa(id)
  if (!empresa) {
    return NextResponse.json({ error: 'Empresa no encontrada', detail: 'ID inválido o sin fila' }, { status: 404 })
  }

  const cached = parseSignalCached(empresa.signal_context)
  if (cached?.generated_at) {
    const age = Date.now() - new Date(cached.generated_at).getTime()
    if (age < 24 * 60 * 60 * 1000) {
      const sc =
        typeof empresa.signal_context === 'string'
          ? JSON.parse(empresa.signal_context)
          : empresa.signal_context
      return NextResponse.json({
        success: true,
        signal_context: sc,
        cached: true,
      })
    }
  }

  const prompt = `
Eres un analista de inteligencia de mercado especializado en fintech latinoamericano.

Empresa: ${empresa.name}
Segmento: ${empresa.segment}
Mercados: ${empresa.mercados}
Funding stage: ${empresa.funding}
Total raised: ${empresa.raised}
Competidores verificados: ${empresa.competidores}
${empresa.notes ? `Notas estratégicas: ${empresa.notes}` : ''}

Usa Google Search para encontrar señales de mercado de las últimas 4 semanas relevantes para ${empresa.name} y su sector en ${empresa.mercados}.

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

  if (process.env.GOOGLE_APIS_PAUSED === 'true') {
    try {
      const tavilyKey = process.env.TAVILY_API_KEY
      let signals: string[] = []
      let sources: { title: string; url: string }[] = []

      if (tavilyKey) {
        const tvRes = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: `${empresa.name} fintech ${empresa.mercados} noticias 2026`,
            max_results: 5,
            include_answer: true,
          }),
        })
        if (tvRes.ok) {
          const tvData = await tvRes.json()
          sources = (tvData.results || []).slice(0, 3).map((r: { title: string; url: string }) => ({
            title: r.title,
            url: r.url,
          }))
          signals = (tvData.results || [])
            .slice(0, 3)
            .map((r: { snippet?: string; title: string }) => r.snippet?.slice(0, 120) || r.title)
        }
      }

      const fallbackSignal = {
        headline: `${empresa.name} — señales activas en ${empresa.mercados}`,
        signals:
          signals.length > 0
            ? signals
            : [
                `${empresa.name} opera en ${empresa.segment} con presencia en ${empresa.mercados}`,
                `Competidores directos: ${empresa.competidores}`,
                `Etapa de financiamiento: ${empresa.funding}`,
              ],
        sentiment: 'neutral' as const,
        sources,
        generated_at: new Date().toISOString(),
        _fallback: true,
      }

      await saveSignalContext(empresa.table, empresa.rowId, fallbackSignal as unknown as Record<string, unknown>)
      return NextResponse.json({ success: true, signal_context: fallbackSignal, cached: false })
    } catch (fallbackErr: unknown) {
      console.error('[MARKET-PULSE FALLBACK ERROR]', (fallbackErr as Error)?.message)
    }
  }

  const modelsTry = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview', 'gemini-2.5-flash']
  let lastError: unknown = null

  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[(currentKeyIndex + i) % apiKeys.length]
    const genAI = new GoogleGenerativeAI(key)

    for (const modelName of modelsTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' })

        // Sin tools: Google Search + function calling requiere context circulation no soportado en estos modelos.
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 },
        })

        const rawText = result.response.text()
        const cleaned = rawText.replace(/```json|```/g, '').trim()
        const signalContext = JSON.parse(cleaned) as Record<string, unknown>
        signalContext.generated_at = new Date().toISOString()

        await saveSignalContext(empresa.table, empresa.rowId, signalContext)

        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length
        return NextResponse.json({ success: true, signal_context: signalContext, cached: false })
      } catch (err: unknown) {
        lastError = err
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`market-pulse key=${i} model=${modelName}:`, msg)
        if (msg.includes('429') || msg.includes('503') || msg.includes('404')) continue
      }
    }
  }

  return NextResponse.json(
    {
      error: 'Error generando Latido del Mercado tras agotar pool de llaves',
      detail: lastError instanceof Error ? lastError.message : String(lastError),
    },
    { status: 500 }
  )
}
