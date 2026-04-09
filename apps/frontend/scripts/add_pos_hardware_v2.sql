-- SQL para agregar Fabricantes de Hardware POS (Actualizado con Market Share 2024)
-- Fuente: Pristine Market Insights 2024

INSERT INTO empresas_v2 (
  name, 
  country, 
  vertical_finnovista, 
  segment_latamfintech, 
  strategic_notes, 
  has_full_data
)
VALUES 
  ('PAX Global Technology', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (9.83% MS) — Movimientos globales anticipan cambios en Latam', false),
  ('Ingenico', 'Francia', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (9.81% MS) — Movimientos globales anticipan cambios en Latam', false),
  ('Verifone', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (7.80% MS) — Movimientos globales anticipan cambios en Latam', false),
  ('Newland NPT', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (5.37% MS) — Movimientos globales anticipan cambios en Latam', false),
  ('Aisino Corporation', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (5.26% MS) — Movimientos globales anticipan cambios en Latam', false),
  ('SUNMI Technology', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (4.02% MS) — Movimientos globales anticipan cambios en Latam', false),
  ('HP', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (3.81% MS) — Diversificación hacia hardware de pago', false),
  ('Toshiba Tec', 'Japón', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (3.32% MS) — Movimientos globales anticipan cambios en Latam', false),
  ('NEXGO', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (3.29% MS) — Movimientos globales anticipan cambios en Latam', false),
  ('Diebold Nixdorf', 'USA/Alemania', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (3.28% MS) — Gigante de cajeros/POS', false),
  ('Fiserv', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (2.96% MS) — Ecosistema Clover', false),
  ('Elo Touch Solutions', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (2.91% MS) — Especialista en pantallas/POS táctiles', false),
  ('iMin Technology', 'China/Singapur', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (2.69% MS) — Crecimiento acelerado en terminales Android', false),
  ('Castles Technology', 'Taiwán', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (2.08% MS) — Movimientos globales anticipan cambios en Latam', false),
  ('Centerm', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (2.02% MS) — Movimientos globales anticipan cambios en Latam', false),
  ('Nexi', 'Italia', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (1.57% MS) — Líder Europeo expandiendo hardware', false),
  ('Block (Square)', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (1.46% MS) — Disrupción en hardware de bajo costo', false),
  ('Toast', 'USA', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (1.39% MS) — Verticalización extrema en restaurantes', false),
  ('Tianyu', 'China', 'Tech Infrastructure', 'Hardware POS', 'Leading indicator (1.32% MS) — Movimientos globales anticipan cambios en Latam', false)
ON CONFLICT (name) DO NOTHING;
