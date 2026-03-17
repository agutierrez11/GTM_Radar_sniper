-- Tabla para caché inteligente de Gemini (TTL 24h manejado por App)
CREATE TABLE IF NOT EXISTS gemini_cache (
    prompt_hash TEXT PRIMARY KEY,
    response JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Índice para búsquedas rápidas por hash
CREATE INDEX IF NOT EXISTS idx_gemini_cache_hash ON gemini_cache(prompt_hash);

-- Política de limpieza opcional: Borrar registros expirados
-- DELETE FROM gemini_cache WHERE expires_at < NOW();
