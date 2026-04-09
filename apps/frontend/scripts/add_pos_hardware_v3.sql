-- SQL FINAL: Schema Update + Mass Insertion (Hardware POS Market Share 2024)

-- 1. Modificar esquema para soportar el nuevo indicador
ALTER TABLE empresas_v2 
ADD COLUMN IF NOT EXISTS market_share_pct numeric;

-- 2. Inserción / Actualización de líderes globales
INSERT INTO empresas_v2 (
  name, 
  country, 
  vertical_finnovista, 
  segment_latamfintech, 
  strategic_notes, 
  market_share_pct,
  has_full_data
)
VALUES 
  ('PAX Global Technology', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — Movimientos globales anticipan cambios en Latam', 9.83, false),
  ('Ingenico', 'Francia', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — Movimientos globales anticipan cambios en Latam', 9.81, false),
  ('Verifone', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — Movimientos globales anticipan cambios en Latam', 7.80, false),
  ('Newland NPT', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — Movimientos globales anticipan cambios en Latam', 5.37, false),
  ('Aisino Corporation', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — Movimientos globales anticipan cambios en Latam', 5.26, false),
  ('SUNMI Technology', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — Movimientos globales anticipan cambios en Latam', 4.02, false),
  ('HP', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Diversificación hacia hardware de pago', 3.81, false),
  ('Toshiba Tec', 'Japón', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — Movimientos globales anticipan cambios en Latam', 3.32, false),
  ('NEXGO', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — Movimientos globales anticipan cambios en Latam', 3.29, false),
  ('Diebold Nixdorf', 'USA/Alemania', 'Tech Infrastructure', 'Hardware POS', 'Gigante de cajeros/POS', 3.28, false),
  ('Fiserv', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Ecosistema Clover', 2.96, false),
  ('Elo Touch Solutions', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Especialista en pantallas/POS táctiles', 2.91, false),
  ('iMin Technology', 'China/Singapur', 'Tech Infrastructure', 'Hardware POS', 'Crecimiento acelerado en terminales Android', 2.69, false),
  ('Castles Technology', 'Taiwán', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — Movimientos globales anticipan cambios en Latam', 2.08, false),
  ('Centerm', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — Movimientos globales anticipan cambios en Latam', 2.02, false),
  ('Nexi', 'Italia', 'Tech Infrastructure', 'Hardware POS', 'Líder Europeo expandiendo hardware', 1.57, false),
  ('Block (Square)', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Disrupción en hardware de bajo costo', 1.46, false),
  ('Toast', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Verticalización extrema en restaurantes', 1.39, false),
  ('Tianyu', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator — Movimientos globales anticipan cambios en Latam', 1.32, false)
ON CONFLICT (name) DO UPDATE SET
  market_share_pct = EXCLUDED.market_share_pct,
  strategic_notes = EXCLUDED.strategic_notes;
