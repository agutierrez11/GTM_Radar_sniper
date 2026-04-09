-- ══════════════════════════════════════════════════════════════════════
-- NERV MemPalace — Supabase Schema
-- Ejecutar en Supabase Dashboard → SQL Editor
--
-- Adapta el concepto de MemPalace (https://github.com/milla-jovovich/mempalace)
-- a Supabase para ser consumido por el pipeline NERV en tiempo real.
--
-- Jerarquía: Wing (dominio) → Room (tema) → Node (contenido)
-- Tunnels: conexiones cross-wing entre nodos
-- ══════════════════════════════════════════════════════════════════════

-- ── Tabla principal de nodos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mempalace_nodes (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,                    -- Nombre de la empresa o concepto (ej: "Galileo Financial")
  content       TEXT NOT NULL,                    -- Contenido estratégico en markdown
  node_type     TEXT DEFAULT 'empresa',           -- empresa | concepto | producto | persona | mercado
  tags          TEXT[] DEFAULT '{}',             -- Tags para búsqueda rápida
  wing          TEXT DEFAULT 'latam',             -- Dominio principal (latam | europe | global)
  room          TEXT DEFAULT 'general',           -- Sub-dominio (payments | lending | igaming | etc.)

  -- Campos estratégicos estructurados (parseados del content para acceso rápido)
  dolor         TEXT,                             -- Dolor crítico documentado
  debilidad     TEXT,                             -- Debilidad verificada
  victoria      TEXT,                             -- Estrategia de victoria
  solucion      TEXT,                             -- Solución sugerida [[LinkName]]

  -- Metadata
  fuente        TEXT,                             -- Fuente del conocimiento (KB, manual, AI)
  confianza     TEXT DEFAULT 'VERIFICADO',        -- VERIFICADO | NO_VERIFICADO | PROYECCIÓN
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Conexiones entre nodos (backlinks relacionales) ──────────────────
CREATE TABLE IF NOT EXISTS mempalace_connections (
  id                    BIGSERIAL PRIMARY KEY,
  source_node_id        BIGINT REFERENCES mempalace_nodes(id) ON DELETE CASCADE,
  target_node_id        BIGINT REFERENCES mempalace_nodes(id) ON DELETE CASCADE,
  connection_type       TEXT DEFAULT 'related',   -- related | competitor | partner | investor | acquirer
  context_of_mention    TEXT,                     -- Por qué están conectados
  strength              NUMERIC DEFAULT 0.5,      -- 0-1, fuerza de la conexión
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── Índices ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_mempalace_nodes_title    ON mempalace_nodes USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_mempalace_nodes_wing     ON mempalace_nodes(wing);
CREATE INDEX IF NOT EXISTS idx_mempalace_nodes_room     ON mempalace_nodes(room);
CREATE INDEX IF NOT EXISTS idx_mempalace_nodes_tags     ON mempalace_nodes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_mempalace_connections_source ON mempalace_connections(source_node_id);
CREATE INDEX IF NOT EXISTS idx_mempalace_connections_target ON mempalace_connections(target_node_id);

-- ── RLS ──────────────────────────────────────────────────────────────
ALTER TABLE mempalace_nodes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE mempalace_connections ENABLE ROW LEVEL SECURITY;

-- Service role bypasea RLS automáticamente.
-- Lectura pública para el pipeline NERV (no datos sensibles):
CREATE POLICY IF NOT EXISTS "Public read mempalace_nodes"
  ON mempalace_nodes FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Public read mempalace_connections"
  ON mempalace_connections FOR SELECT USING (true);

-- ── RPC: get_node_connections ─────────────────────────────────────────
-- Devuelve todos los nodos conectados al nodo target, con contexto.
-- Usado por resolveMemPalaceNode() en nexus/route.ts
CREATE OR REPLACE FUNCTION get_node_connections(target_id BIGINT)
RETURNS TABLE (
  connected_node_id     BIGINT,
  connected_node_title  TEXT,
  connection_type       TEXT,
  context_of_mention    TEXT,
  strength              NUMERIC
) LANGUAGE sql STABLE AS $$
  SELECT
    CASE
      WHEN mc.source_node_id = target_id THEN mc.target_node_id
      ELSE mc.source_node_id
    END AS connected_node_id,
    mn.title AS connected_node_title,
    mc.connection_type,
    mc.context_of_mention,
    mc.strength
  FROM mempalace_connections mc
  JOIN mempalace_nodes mn ON mn.id = CASE
    WHEN mc.source_node_id = target_id THEN mc.target_node_id
    ELSE mc.source_node_id
  END
  WHERE mc.source_node_id = target_id OR mc.target_node_id = target_id
  ORDER BY mc.strength DESC
  LIMIT 10;
$$;

-- ── Trigger: actualizar updated_at automáticamente ───────────────────
CREATE OR REPLACE FUNCTION update_mempalace_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER mempalace_nodes_updated_at
  BEFORE UPDATE ON mempalace_nodes
  FOR EACH ROW EXECUTE FUNCTION update_mempalace_updated_at();

-- ── Datos semilla: nodo de Galileo Financial Technologies ────────────
-- Pre-cargar para la demo de mañana
INSERT INTO mempalace_nodes (title, content, node_type, wing, room, dolor, debilidad, victoria, tags, fuente, confianza)
VALUES (
  'Galileo Financial Technologies',
  E'# Galileo Financial Technologies\n\n## Perfil\nProveedor de infraestructura fintech (Banking-as-a-Service) para América Latina. Adquirida por SoFi en 2020 por $1.2B.\n\n## Dolor:\nIntegración con procesadores locales en LATAM — cada país tiene su propio switch, BIN ranges y regulación. Tiempo de integración promedio: 6-18 meses por mercado nuevo.\n\n## Debilidad:\nCobertura fragmentada en mercados como México (SPEI), Colombia (ACH), Perú (BIM). Sus clientes piden más velocidad de onboarding.\n\n## Victoria:\nSi NERV puede mapear qué fintechs en LATAM están en expansión y necesitan infraestructura de procesamiento, Galileo puede llegar antes que la competencia.\n\n## Solución: [[NERV GTM Intelligence]]\n\n## Contexto de Mercado\n- SPEI procesó 7,700 millones de transacciones en 2025\n- Brasil: PIX domina con 42% de todas las transacciones digitales\n- Colombia: ACH en proceso de modernización\n- Regulación CNBV México exige homologación SPEI para todas las fintechs',
  'empresa',
  'latam',
  'infrastructure',
  'Integración lenta con procesadores LATAM — 6-18 meses por mercado',
  'Cobertura fragmentada en México, Colombia, Perú vs competidores con stack nativo',
  'Mapear fintechs en expansión activa que necesitan BaaS — llegar antes que Stripe Treasury o Rapyd',
  ARRAY['galileo', 'baas', 'infraestructura', 'latam', 'sofi', 'procesamiento'],
  'manual_nerv',
  'VERIFICADO'
) ON CONFLICT DO NOTHING;

-- ── Verificar instalación ─────────────────────────────────────────────
SELECT 'MemPalace instalado correctamente. Nodos: ' || COUNT(*) FROM mempalace_nodes;
