# SQL: Estructura de Red Multidimensional (Supabase) 🏗️🔐

Este script SQL transformará tu base de datos de una "hoja de cálculo" a una **Base de Datos de Grafos Relacionales**.

## Objetivos
1.  **Eliminar la dependencia plana:** Las empresas ahora son nodos conectados.
2.  **Integridad Total:** Evitar que el grafo se rompa si falta un dato.
3.  **Filtrado por Eje:** Poder ver "Solo México" o "Solo rieles PIX".

## Script SQL Sugerido
Copia y pega esto en el **SQL Editor** de Supabase:

-- 1. Asegurar campo de Atribución en Empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS source_attribution text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS source_url text;

-- 2. Nueva Bóveda de Reportes Estratégicos
CREATE TABLE IF NOT EXISTS documentary_intelligence (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    author text,
    publish_date date,
    summary text,
    file_path text,
    tags text[]
);

-- 3. Tabla de Tipos de Nodos (País, Vertical, Riel, Regulación)
INSERT INTO ecosystem_categories (name, axis) VALUES 
-- Países
('México', 'COUNTRY'), ('Brasil', 'COUNTRY'), ('Colombia', 'COUNTRY'), ('Chile', 'COUNTRY'), ('Argentina', 'COUNTRY'),
-- Verticales (Basadas en Condusef/Sisgain/RappiCard)
('Pagos y Transferencias', 'VERTICAL'), 
('Banca Digital (Neobancos)', 'VERTICAL'),
('Préstamos y Lending (SME/P2P/BNPL)', 'VERTICAL'),
('Crowdfunding (Inmobiliario/Equity)', 'VERTICAL'),
('Insurtech (Seguros)', 'VERTICAL'),
('Wealthtech (Inversión/Trading)', 'VERTICAL'),
('Criptomonedas y Blockchain', 'VERTICAL'),
('Regtech (Compliance/KYC/AML)', 'VERTICAL'),
('Finanzas Integradas (Embedded Finance)', 'VERTICAL'),
-- Rieles (Money Trail)
('PIX (BR)', 'RAIL'), ('SPEI / CoDi (MX)', 'RAIL'), ('PSE (CO)', 'RAIL'), ('SWIFT', 'RAIL'), 
('Card Networks (Visa/MC)', 'RAIL'), ('STP', 'RAIL'),
-- Regulaciones (Compliance & Oversight)
('Condusef (MX)', 'REGULATION'), 
('CNBV / Ley Fintech (MX)', 'REGULATION'), 
('BCB (BR)', 'REGULATION'), 
('SFC (CO)', 'REGULATION'),
('CMF (CL)', 'REGULATION')
ON CONFLICT (name) DO UPDATE SET axis = EXCLUDED.axis;

-- 3. Tabla de Relaciones Dinámicas (The Connectivity Edge)
CREATE TABLE IF NOT EXISTS connections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    source_id uuid NOT NULL, -- Referencia a tabla 'empresas' o 'categories'
    target_id uuid NOT NULL,
    connection_type text DEFAULT 'DEPENDENCE',
    metadata jsonb
);

-- 4. Vista de Inteligencia para el Grafo
CREATE OR REPLACE VIEW v_knowledge_graph AS
SELECT 
    c.id, 
    c.source_id, 
    c.target_id, 
    c.connection_type 
FROM connections c;
```

## Próximo Paso
Una vez ejecutado, el motor de Python (Sniper Engine) empezará a llenar estas tablas automáticamente al analizar cada lead.

**¿Quieres que te prepare el post de LinkedIn para acompañar estas gráficas una vez que las activemos?** 🚀🎯🛡️
