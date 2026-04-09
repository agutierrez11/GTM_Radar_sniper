-- SQL COMPLETO: Inserción Deduplicada de Hardware POS (19 Empresas)
-- 1. Asegurar columna (En caso de que no se haya ejecutado aún)
ALTER TABLE empresas_v2 ADD COLUMN IF NOT EXISTS market_share_pct numeric;

-- 2. Inserción con lógica anti-duplicados (WHERE NOT EXISTS)
INSERT INTO empresas_v2 (name, country, vertical_finnovista, segment_latamfintech, strategic_notes, market_share_pct, has_full_data)
SELECT v.name, v.country, v.vertical, v.segment, v.notes, v.ms, false
FROM (VALUES
  ('PAX Global Technology', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 9.83),
  ('Ingenico', 'Francia', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 9.81),
  ('Verifone', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 7.80),
  ('Newland NPT', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 5.37),
  ('Aisino Corporation', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 5.26),
  ('SUNMI Technology', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 4.02),
  ('HP', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 3.81),
  ('Toshiba Tec', 'Japón', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 3.32),
  ('NEXGO', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 3.29),
  ('Diebold Nixdorf', 'USA/Alemania', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 3.28),
  ('Fiserv', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 2.96),
  ('Elo Touch Solutions', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 2.91),
  ('iMin Technology', 'China/Singapur', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 2.69),
  ('Castles Technology', 'Taiwán', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 2.08),
  ('Centerm', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 2.02),
  ('Nexi', 'Italia', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 1.57),
  ('Block (Square)', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 1.46),
  ('Toast', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 1.39),
  ('Tianyu', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator', 1.32)
) AS v(name, country, vertical, segment, notes, ms)
WHERE NOT EXISTS (
  SELECT 1 FROM empresas_v2 e WHERE e.name = v.name
);
