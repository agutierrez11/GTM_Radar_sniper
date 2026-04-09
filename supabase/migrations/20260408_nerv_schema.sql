-- NERV GTM Intelligence Platform
-- Supabase Schema — empresas_v3
-- Run this in Supabase SQL Editor

-- Enable pgvector extension
create extension if not exists vector;

-- Drop old table if migrating from v2
-- drop table if exists empresas_v3;

create table if not exists empresas_v3 (
  -- Primary key
  id                  bigserial primary key,

  -- Identity
  nombre              text not null,
  website             text unique not null,
  pais_hq             text,
  mercados_latam      text[],
  ano_fundacion       integer,

  -- Funding & Scale
  etapa_funding       text,
  total_raised_usd    bigint,
  empleados_aprox     text,
  tier                text check (tier in ('Tier 1', 'Tier 2', 'Tier 3')),
  tier_razon          text,

  -- Product
  vertical            text,
  modelo_negocio      text,
  plataforma          jsonb,
  productos_destacados jsonb,
  modulos             text[],
  casos_de_uso        jsonb,
  industrias_objetivo text[],
  core                text,
  uvp                 text,

  -- GTM Intelligence
  strategic_hook      text,
  pain_1_conversion   text,
  pain_2_compliance   text,
  pain_3_fraude       text,
  competidor_1        text,
  competidor_2        text,
  competidor_3        text,
  killer_argument     text,
  cliente_ideal       text,
  clientes_actuales   text,
  ticket_promedio_usd text,
  framework_venta     text,
  strategic_notes     text,

  -- Market Signals
  signal_context      text,

  -- Embeddings
  embedding_text      text,
  embedding_vector    vector(768),
  embedding_model     text default 'gemini-embedding-001',
  embedding_at        timestamptz,

  -- Metadata
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Index for vector similarity search (cosine distance)
create index if not exists empresas_v3_embedding_idx
  on empresas_v3
  using ivfflat (embedding_vector vector_cosine_ops)
  with (lists = 100);

-- Index for country filtering
create index if not exists empresas_v3_pais_idx
  on empresas_v3 (pais_hq);

-- Index for tier filtering
create index if not exists empresas_v3_tier_idx
  on empresas_v3 (tier);

-- Index for vertical filtering
create index if not exists empresas_v3_vertical_idx
  on empresas_v3 (vertical);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger empresas_v3_updated_at
  before update on empresas_v3
  for each row execute function update_updated_at();

-- RPC function for semantic search (used by frontend)
create or replace function match_empresas(
  query_embedding vector(768),
  match_threshold float default 0.7,
  match_count     int    default 10,
  filter_pais     text   default null,
  filter_tier     text   default null,
  filter_vertical text   default null
)
returns table (
  id              bigint,
  nombre          text,
  website         text,
  pais_hq         text,
  vertical        text,
  tier            text,
  strategic_hook  text,
  pain_1_conversion text,
  killer_argument text,
  framework_venta text,
  signal_context  text,
  uvp             text,
  similarity      float
)
language sql stable
as $$
  select
    e.id,
    e.nombre,
    e.website,
    e.pais_hq,
    e.vertical,
    e.tier,
    e.strategic_hook,
    e.pain_1_conversion,
    e.killer_argument,
    e.framework_venta,
    e.signal_context,
    e.uvp,
    1 - (e.embedding_vector <=> query_embedding) as similarity
  from empresas_v3 e
  where
    1 - (e.embedding_vector <=> query_embedding) > match_threshold
    and (filter_pais    is null or e.pais_hq  = filter_pais)
    and (filter_tier    is null or e.tier      = filter_tier)
    and (filter_vertical is null or e.vertical = filter_vertical)
  order by e.embedding_vector <=> query_embedding
  limit match_count;
$$;

-- Enable Row Level Security (optional, for multi-tenant future)
alter table empresas_v3 enable row level security;

-- Allow service role full access
create policy "Service role full access"
  on empresas_v3
  for all
  to service_role
  using (true)
  with check (true);

-- Allow anon read (for frontend queries)
create policy "Public read"
  on empresas_v3
  for select
  to anon
  using (true);
