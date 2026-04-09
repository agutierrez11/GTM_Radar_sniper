-- SQL para agregar Fabricantes de Hardware POS (Leading Indicators)
-- Ejecutar en el Editor SQL de Supabase

INSERT INTO empresas_v2 (
  name, 
  country, 
  vertical_finnovista, 
  segment_latamfintech, 
  strategic_notes, 
  has_full_data
)
VALUES 
  ('PAX Global Technology', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — movimientos globales anticipan cambios en ecosistema Latam en 6-18 meses', false),
  ('Ingenico', 'Francia', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — movimientos globales anticipan cambios en ecosistema Latam en 6-18 meses', false),
  ('Verifone', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — movimientos globales anticipan cambios en ecosistema Latam en 6-18 meses', false),
  ('Newland (Fujian Newland Computer)', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — movimientos globales anticipan cambios en ecosistema Latam en 6-18 meses', false),
  ('Aisino Corporation', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — movimientos globales anticipan cambios en ecosistema Latam en 6-18 meses', false),
  ('SUNMI Technology', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — movimientos globales anticipan cambios en ecosistema Latam en 6-18 meses', false),
  ('Toshiba Tec', 'Japón', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — movimientos globales anticipan cambios en ecosistema Latam en 6-18 meses', false),
  ('NEXGO', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — movimientos globales anticipan cambios en ecosistema Latam en 6-18 meses', false),
  ('Toast', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — movimientos globales anticipan cambios en ecosistema Latam en 6-18 meses', false),
  ('Fiserv', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — movimientos globales anticipan cambios en ecosistema Latam en 6-18 meses', false)
ON CONFLICT (name) DO NOTHING;
