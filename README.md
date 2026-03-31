# NERV — GTM Intelligence Platform for Fintech LATAM

## What is NERV?

NERV is a GTM intelligence platform that transforms raw fintech company data into actionable sales intelligence. Instead of a generic directory, NERV produces 37-field McKinsey-quality profiles per company — including buyer-POV pain points, strategic hooks, competitor mapping, and sales frameworks — enriched with real-time market signals.

**Target user:** B2B sales directors at financial infrastructure companies (processors, BIN sponsors, compliance tech) selling into the LATAM fintech ecosystem.

**Reference client:** Galileo Financial Technologies — LATAM Strategic Sales Director needs to identify which of 1,000+ LATAM fintechs have active buying signals today.

---

## Current State (March 2026)

| Metric | Value |
|--------|-------|
| Total companies enriched | ~1,494 |
| Companies with website + full 37-field profile | 1,470 |
| Countries covered | MX, CO, BR, AR, CL, PE, UY, PY, BO, VE, GT, PA |
| Embedding model | gemini-embedding-001 (768 dimensions) |
| Vector DB target | Supabase pgvector (empresas_v3) |
| Current output | CSV files (local) |
| Frontend | nexus-poc (Next.js, Vercel) — nexus-poc-woad.vercel.app |

---

## Architecture

```
Data Sources
├── Finnovista Fintech Radar (MX, CO, BR, AR, CL)
├── LatamFintech.co directory
├── Colombia Fintech association (269 companies)
├── FinteChile association (175 companies)
└── 7 other country associations

Pipeline (local, Python 3.14)
├── nerv_enricher.py          ← Main enrichment script
│   ├── Firecrawl API         → Website scraping
│   ├── Tavily API            → Market signals (funding, expansion)
│   ├── Gemini 2.5 Flash      → 37-field JSON generation (McKinsey prompt)
│   └── gemini-embedding-001  → 768-dim vector embeddings
├── nerv_url_lookup.py        ← URL discovery for companies without website
├── prepare_phase2.py         ← Batch preparation scripts
└── prepare_phase2_batch2.py

Storage (target)
└── Supabase PostgreSQL + pgvector
    └── empresas_v3 (see infra/supabase_schema.sql)

Frontend
└── nexus-poc (Next.js 14, Supabase client, pgvector similarity search)
```

---

## Data Schema — 37 Fields

### Identity
| Field | Type | Description |
|-------|------|-------------|
| nombre | string | Company name |
| website | string | Primary URL |
| pais_hq | string | HQ country |
| mercados_latam | array | Markets where they operate |
| ano_fundacion | integer | Founded year |

### Funding & Scale
| Field | Type | Description |
|-------|------|-------------|
| etapa_funding | string | Pre-seed / Seed / Series A / B / C / Public |
| total_raised_usd | integer | Total funding in USD |
| empleados_aprox | string | Employee range |
| tier | string | Tier 1 (>$10M) / Tier 2 ($1-10M) / Tier 3 (early) |
| tier_razon | string | Reasoning for tier assignment |

### Product
| Field | Type | Description |
|-------|------|-------------|
| vertical | string | Payments / Lending / InsurTech / WealthTech / etc |
| modelo_negocio | string | B2B / B2C / B2B2C |
| plataforma | json | Core platform description, architecture, capabilities |
| productos_destacados | json | Key products with differentiators |
| modulos | array | Feature modules |
| casos_de_uso | json | Use cases |
| industrias_objetivo | array | Target industries |
| core | string | Core technology/capability |
| uvp | string | Unique value proposition |

### GTM Intelligence (the differentiator)
| Field | Type | Description |
|-------|------|-------------|
| strategic_hook | string | Provocative question ending in "?" — buyer POV |
| pain_1_conversion | string | Conversion/growth pain point |
| pain_2_compliance | string | Regulatory/compliance pain point |
| pain_3_fraude | string | Fraud/risk pain point |
| competidor_1 | string | Primary competitor (real company names) |
| competidor_2 | string | Secondary competitor |
| competidor_3 | string | Tertiary competitor |
| killer_argument | string | The one argument that wins the deal |
| cliente_ideal | string | ICP description with buyer personas |
| clientes_actuales | string | Known current clients |
| ticket_promedio_usd | string | Average deal size estimate |
| framework_venta | string | CHALLENGER / MEDDIC / SPIN / INBOUND |
| strategic_notes | string | Additional GTM context |

### Market Signals
| Field | Type | Description |
|-------|------|-------------|
| signal_context | string | Recent funding/expansion news (Tavily) |

### Embeddings
| Field | Type | Description |
|-------|------|-------------|
| embedding_text | string | 450-500 word analytical prose (input to embedding) |
| embedding_vector | vector(768) | Semantic vector for similarity search |
| embedding_model | string | gemini-embedding-001 |
| embedding_at | timestamp | When embedding was generated |

---

## Pipeline Flow

```
1. NERV_MASTER_VERIFIED.csv (2,614 companies)
   └── Filter: has website → 790 companies (Phase 1)

2. For each company:
   a. Firecrawl scrape website → markdown content
   b. If content < 200 chars → Tavily search for market signals
   c. Build McKinsey V12 prompt with context
   d. Gemini 2.5 Flash → 37-field JSON
   e. gemini-embedding-001 → 768-dim vector
   f. Append to CSV output

3. Phase 2: Companies without website
   a. Tavily URL lookup → find website
   b. Recover 677 URLs from NERV_GOD_MASTER_ULTIMATE_2026.csv
   c. Run enricher on recovered URLs

4. Upload CSVs → Supabase empresas_v3 (pending)
```

---

## What Needs to Be Built

### Immediate (before April demo)
- [ ] Upload enriched CSVs to Supabase `empresas_v3`
- [ ] Fix 3 bugs in nexus-poc frontend

### Infrastructure (this is why you're here)
- [ ] Move pipeline from local laptop to cloud
- [ ] Automate weekly refresh cycle (new companies, signal updates)
- [ ] pgvector index optimization for <100ms similarity search
- [ ] API layer for frontend queries

### Future
- [ ] GraphRAG on top of embeddings (MiroFish-style)
- [ ] Real-time signal monitoring (Tavily webhooks)
- [ ] Multi-tenant access (sales teams)

---

## Tech Stack

```
Pipeline:    Python 3.14, asyncio, aiohttp, pandas
LLM:         Google Gemini 2.5 Flash (generation) + gemini-embedding-001
Scraping:    Firecrawl API
Signals:     Tavily API
Database:    Supabase (PostgreSQL + pgvector extension)
Frontend:    Next.js 14, Supabase JS client
Deploy:      Vercel (frontend)
```

## Environment Variables Required

See `.env.example` for required keys:
- `GEMINI_API_KEY_1/2/3` — Round robin across 3 keys
- `FIRECRAWL_API_KEY` — Website scraping
- `TAVILY_API_KEY` / `TAVILY_API_KEY_2` — Market signals + URL lookup
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — Database
- `CSV_SOURCE` — Input file path
- `LOG_PATH` — Output file path
