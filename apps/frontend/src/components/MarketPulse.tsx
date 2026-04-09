'use client'

import { useState, useEffect } from 'react'

interface SignalContext {
  headline: string
  signals: string[]
  sentiment: 'bullish' | 'bearish' | 'neutral'
  sources: { title: string; url: string }[]
  generated_at: string
}

interface MarketPulseProps {
  /** empresas_v3 puede usar UUID o entero según el proyecto */
  empresaId: number | string
  empresaNombre: string
  cachedSignal?: SignalContext | null
}

const SENTIMENT = {
  bullish: {
    label: 'Bullish',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
    dot: 'bg-emerald-400',
    icon: '↑',
  },
  bearish: {
    label: 'Bearish',
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    dot: 'bg-red-400',
    icon: '↓',
  },
  neutral: {
    label: 'Neutral',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/20',
    dot: 'bg-yellow-400',
    icon: '→',
  },
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export function MarketPulse({ empresaId, empresaNombre, cachedSignal }: MarketPulseProps) {
  const [data, setData] = useState<SignalContext | null>(cachedSignal ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cachedSignal) fetchPulse()
  }, [empresaId])

  async function fetchPulse() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/market-pulse/${empresaId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error desconocido')
      setData(json.signal_context)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const s = data ? SENTIMENT[data.sentiment] : null

  return (
    <div className="mt-6 border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
            Latido del Mercado
          </span>
          {data && s && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${s.bg} ${s.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
              {s.icon} {s.label}
            </span>
          )}
        </div>
        <button
          onClick={fetchPulse}
          disabled={loading}
          className="text-xs text-white/30 hover:text-white/60 transition-colors disabled:opacity-30 flex items-center gap-1"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Buscando...
            </>
          ) : '↻ Actualizar'}
        </button>
      </div>

      <div className="p-4">
        {loading && !data && (
          <div className="space-y-3 animate-pulse">
            <div className="h-5 bg-white/10 rounded w-3/4"/>
            <div className="space-y-2 mt-4">
              <div className="h-3 bg-white/10 rounded w-full"/>
              <div className="h-3 bg-white/10 rounded w-5/6"/>
              <div className="h-3 bg-white/10 rounded w-4/6"/>
            </div>
          </div>
        )}

        {error && !loading && (
          <p className="text-red-400/80 text-xs font-mono py-2">⚠ {error}</p>
        )}

        {!data && !loading && !error && (
          <button
            onClick={fetchPulse}
            className="w-full py-6 text-white/30 hover:text-white/50 text-sm transition-colors"
          >
            + Generar Latido del Mercado para {empresaNombre}
          </button>
        )}

        {data && !loading && (
          <div className="space-y-4">
            <p className="text-white/90 text-sm font-medium leading-snug">{data.headline}</p>

            <ul className="space-y-2">
              {data.signals.map((signal, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                  <span className="text-white/20 font-mono mt-0.5 shrink-0">{i + 1}.</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>

            {data.sources?.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <p className="text-white/20 text-xs mb-1.5 font-mono uppercase tracking-wider">Fuentes</p>
                <div className="flex flex-wrap gap-2">
                  {data.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors truncate max-w-[200px]"
                    >
                      {src.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <p className="text-white/20 text-xs font-mono">
              {timeAgo(data.generated_at)} · gemini-3-flash-preview
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
