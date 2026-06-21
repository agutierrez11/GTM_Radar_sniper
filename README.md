# NERV — GTM Intelligence Platform for Fintech LATAM

<p align="center">
  <a href="#-english">🇺🇸 English</a> | 
  <a href="#-español">🇪🇸 Español</a>
</p>

---

## 🇺🇸 English

### What is NERV?
NERV is a GTM intelligence platform that transforms raw fintech company data into actionable sales intelligence. Instead of a generic directory, NERV produces 37-field McKinsey-quality profiles per company — including buyer-POV pain points, strategic hooks, competitor mapping, and sales frameworks — enriched with real-time market signals.

* **Target user:** B2B sales directors at financial infrastructure companies (processors, BIN sponsors, compliance tech) selling into the LATAM fintech ecosystem.
* **Reference client:** Galileo Financial Technologies — LATAM Strategic Sales Director needs to identify which of 1,000+ LATAM fintechs have active buying signals today.

### Current State (March 2026)
| Metric | Value |
|--------|-------|
| Total companies enriched | ~1,494 |
| Companies with website + full 37-field profile | 1,470 |
| Countries covered | MX, CO, BR, AR, CL, PE, UY, PY, BO, VE, GT, PA |
| Embedding model | gemini-embedding-001 (768 dimensions) |
| Vector DB target | Supabase pgvector (empresas_v3) |
| Current output | CSV files (local) |
| Frontend | Next.js 14 (Vercel) |

### Architecture
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
└── prepare_phase2.py         ← Batch preparation scripts

Storage
└── Supabase PostgreSQL + pgvector
    └── empresas_v3 (see infra/supabase_schema.sql)

Frontend
└── Next.js 14, Supabase client, pgvector similarity search
```

### Tech Stack
* **Pipeline:** Python 3.14, asyncio, aiohttp, pandas
* **LLM:** Google Gemini 2.5 Flash (generation) + gemini-embedding-001
* **Scraping:** Firecrawl API
* **Signals:** Tavily API
* **Database:** Supabase (PostgreSQL + pgvector extension)
* **Frontend:** Next.js 14, Supabase JS client
* **Deployment:** Vercel (frontend)

---

## 🇪🇸 Español

### ¿Qué es NERV?
NERV es una plataforma de inteligencia GTM (Go-To-Market) que transforma datos brutos de empresas fintech en inteligencia comercial accionable. En lugar de un directorio genérico, NERV genera perfiles de calidad McKinsey con 37 campos por empresa, incluyendo puntos de dolor del comprador, ganchos estratégicos, mapeo de competidores y metodologías de venta, todo enriquecido con señales de mercado en tiempo real.

* **Usuario objetivo:** Directores de ventas B2B en empresas de infraestructura financiera (procesadores, BIN sponsors, tecnología de cumplimiento) que venden al ecosistema fintech de LATAM.
* **Cliente de referencia:** Galileo Financial Technologies — El Director de Ventas Estratégicas para LATAM necesita identificar cuáles de las más de 1,000 fintechs de LATAM tienen señales de compra activas hoy.

### Estado Actual (Marzo 2026)
| Métrica | Valor |
|--------|-------|
| Total de empresas enriquecidas | ~1,494 |
| Empresas con sitio web + perfil completo de 37 campos | 1,470 |
| Países cubiertos | MX, CO, BR, AR, CL, PE, UY, PY, BO, VE, GT, PA |
| Modelo de embeddings | gemini-embedding-001 (768 dimensiones) |
| Base de datos vectorial | Supabase pgvector (empresas_v3) |
| Formato de salida actual | Archivos CSV (local) |
| Frontend | Next.js 14 (Vercel) |

### Arquitectura
```
Fuentes de Datos
├── Finnovista Fintech Radar (MX, CO, BR, AR, CL)
├── Directorio LatamFintech.co
├── Asociación Colombia Fintech (269 empresas)
├── Asociación FinteChile (175 empresas)
└── Otras 7 asociaciones nacionales

Pipeline (local, Python 3.14)
├── nerv_enricher.py          ← Script principal de enriquecimiento
│   ├── Firecrawl API         → Raspado (scraping) de sitios web
│   ├── Tavily API            → Señales de mercado (financiamiento, expansión)
│   ├── Gemini 2.5 Flash      → Generación de JSON con 37 campos (prompt McKinsey)
│   └── gemini-embedding-001  → Embeddings vectoriales de 768 dimensiones
├── nerv_url_lookup.py        ← Descubrimiento de URLs para empresas sin sitio
└── prepare_phase2.py         ← Scripts de preparación por lotes (batch)

Almacenamiento
└── Supabase PostgreSQL + pgvector
    └── empresas_v3 (ver infra/supabase_schema.sql)

Frontend
└── Next.js 14, cliente Supabase, búsqueda por similitud pgvector
```

### Stack Tecnológico
* **Pipeline:** Python 3.14, asyncio, aiohttp, pandas
* **LLM:** Google Gemini 2.5 Flash (generación) + gemini-embedding-001
* **Scraping:** Firecrawl API
* **Señales:** Tavily API
* **Base de Datos:** Supabase (PostgreSQL + extensión pgvector)
* **Frontend:** Next.js 14, cliente JS de Supabase
* **Despliegue:** Vercel (frontend)
