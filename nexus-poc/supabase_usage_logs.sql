-- NERV Usage Logs — Ejecutar en Supabase Dashboard → SQL Editor
-- Registra cada análisis corrido por usuarios autenticados

CREATE TABLE IF NOT EXISTS usage_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email  TEXT,
  empresa     TEXT NOT NULL,
  producto    TEXT,
  pais        TEXT,
  vertical    TEXT,
  tier        TEXT,
  icp_score   NUMERIC,
  duration_ms INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries de métricas
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_empresa ON usage_logs(empresa);

-- RLS: usuarios solo ven sus propios logs; service role bypasea automáticamente
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users see own logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Verificar que la tabla se creó bien
SELECT 'usage_logs creada correctamente — ' || COUNT(*) || ' registros' FROM usage_logs;
