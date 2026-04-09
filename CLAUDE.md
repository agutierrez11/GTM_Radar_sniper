# NERV — GTM Intelligence OS
## Contexto de Proyecto para Claude Code

> "El sistema nervioso del ecosistema Fintech LATAM"

---

## 🧭 QUÉ ES NERV

NERV es un SaaS de GTM Intelligence para equipos de ventas B2B en FinTech LATAM.
Dado el nombre de una empresa target, genera en <30 segundos:
- ICP Score (0-100)
- Análisis forense de dolores y fricciones
- Plan de ataque con apertura lista para usar
- Contexto competitivo + empresas similares
- Battlecard descargable en .md

**No es un directorio. Es el sniper — te dice a quién, cómo y cuándo disparar.**

---

## 🏗️ STACK TÉCNICO

```
Frontend:     Next.js 15 (App Router) + TypeScript
Backend:      Next.js API Routes (serverless)
DB:           Supabase (PostgreSQL + pgvector)
LLM:          Anthropic claude-sonnet-4-5 → Groq llama-3.3-70b (fallback)
Embeddings:   sentence-transformers/all-mpnet-base-v2 (768 dims, local)
Deploy:       Vercel (production) → migrando a GCP Cloud Run
Repo:         github.com/agutierrez11/GTM_Radar_sniper
App:          nexus-poc/ (Next.js app)
Engine:       engine/ (Python scripts — KB, embeddings, data pipeline)
```

---

## 📁 ESTRUCTURA CLAVE

```
nexus-poc/
├── src/app/api/
│   ├── nexus/route.ts          ← CORE: pipeline RaiSE v3.1 (3 agentes)
│   ├── discovery/route.ts      ← Discovery Semántico (búsqueda natural)
│   ├── market-pulse/[id]/      ← Señales de mercado por empresa
│   ├── log-usage/route.ts      ← Tracking de uso
│   └── healthcheck/route.ts    ← Diagnóstico de env vars
├── src/components/NervForm.tsx  ← UI principal
├── src/lib/
│   ├── gemini.ts               ← Orquestador LLM (Gemini → Claude → Groq)
│   ├── groq.ts                 ← Cliente Groq directo
│   └── supabase.ts             ← Cliente Supabase
├── middleware.ts                ← Auth guard + DEMO_MODE bypass
engine/
├── embed_knowledge_base.py     ← Embeddea KB a Supabase
├── kb_quality_layer.py         ← Quality gate antes de embedear
├── sincronizar_palacio_memoria.py ← Sync de fichas a Supabase
└── .env                        ← Keys locales (NO commitear)
knowledge_base/                 ← Documentos .md del KB
```

---

## 🤖 PIPELINE RaiSE v3.1

3 agentes en secuencia:

1. **Cosechador** → extrae señales y hechos forenses de la empresa target
2. **Retador** → red team — destruye la propuesta, encuentra objeciones
3. **Sintetizador** → genera el dossier final JSON con battlecard .md

Con RAG: antes del pipeline, se embeddea la query y se recuperan chunks del KB.
Con MemPalace: si existe un nodo de la empresa en mempalace_nodes, se inyecta como "verdad absoluta".

---

## 🗄️ SUPABASE — TABLAS PRINCIPALES

| Tabla | Contenido |
|---|---|
| `empresas_v3` | 1,899 fintechs LATAM — columnas: `nombre`, `pais_hq`, `vertical`, `uvp`, `tier`, `embedding_vector` |
| `knowledge_base` | KB embeddeado — columnas: `id`, `content`, `metadata`, `embedding` (768 dims) |
| `mempalace_nodes` | Grafo de inteligencia — empresas, personas, mercados |
| `usage_logs` | Tracking de uso por sesión |
| `gemini_cache` | ⚠️ NO EXISTE AÚN — crear antes de activar caché |

---

## ⚠️ GAPS CRÍTICOS ACTIVOS

1. **NERV API falla en producción** — `ANTHROPIC_API_KEY` y `GROQ_API_KEY` no son visibles en el runtime de Vercel. Verificar que estén en scope `Production + Preview + Development`. El healthcheck está en `/api/healthcheck`.

2. **gemini_cache no existe en Supabase** — crear la tabla o quitar las referencias al caché.

3. **GOOGLE_APIS_PAUSED=true** — Gemini está desactivado. El LLM route va directo a Claude (claude-sonnet-4-5) → Groq fallback.

4. **Discovery Semántico** — usa búsqueda por texto (columnas: `pais_hq`, `vertical`), NO pgvector, porque Gemini está pausado.

---

## 🔑 ENV VARS REQUERIDAS

```bash
# Vercel (producción)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=          # claude-sonnet-4-5
GROQ_API_KEY=               # llama-3.3-70b-versatile
GOOGLE_APIS_PAUSED=true     # mientras Gemini esté caído
NEXT_PUBLIC_DEMO_MODE=true  # bypass auth para demos
ADMIN_SECRET_TOKEN=         # para /api/admin/metrics

# Engine Python (local, engine/.env)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=             # para embeddings (pausado)
OPENAI_API_KEY=             # fallback embeddings (quota)
```

---

## 🧱 FRAMEWORKS Y RECURSOS

| Recurso | URL | Uso en NERV |
|---|---|---|
| RaiSE v2.3 | github.com/humansys/raise | Base del pipeline 3-agentes |
| MiroFish | github.com/666ghj/MiroFish | Multi-agent simulation — Fase 4/5 |
| Paperclip | github.com/paperclipai/paperclip | Auditoría de outputs |
| MemPalace | github.com/milla-jovovich/mempalace | Memoria relacional |
| Superpowers | github.com/obra/superpowers | Skills de desarrollo |
| BMAD Method | docs.bmad-method.org | Framework de arquitectura |
| OSINTNova | osintnova.com | Señales OSINT para KB |
| Company OS | github.com/Workflowsio/company-os-starter-kit | Estructura de equipo |

---

## 👥 EQUIPO

| Rol | Persona | Focus |
|---|---|---|
| CEO / Product | Antonio (Toño) | Visión, GTM, relaciones |
| Data Science | (PhD Astrofísica) | Embeddings propios, ICP Score ML, pipeline |
| Full Stack / Infra | Felipe (Feli) | Deploy, APIs, Cloud Run, todo lo roto |
| — | Juan | Data |

---

## 🚫 REGLAS — NO HACER

- **No usar `pais` o `vertical_finnovista`** — las columnas reales son `pais_hq` y `vertical`
- **No hardcodear API keys** en el código
- **No commitear `.env`** ni `engine/.env`
- **No usar `response_format: json_object` en Groq** a menos que el prompt mencione JSON explícitamente
- **No aluucinar datos** de empresas — si no hay fuente, decir "No encontrado"
- **No cambiar el nombre del RPC `match_kb`** — es para knowledge_base. `match_empresas` es para empresas_v3

---

## ✅ CONVENCIONES

- Commits en español con prefijos: `feat:`, `fix:`, `diag:`, `refactor:`
- El campo `markdown` en el output del Sintetizador es la battlecard descargable — formato Sumsub
- `DEMO_MODE=true` en Vercel = acceso sin login a `/app`
- Todos los cambios críticos se prueban con `curl` antes de commitear

---

## 🎯 PRIORIDAD INMEDIATA

1. Resolver env vars en Vercel (ANTHROPIC_API_KEY + GROQ_API_KEY no visibles)
2. Crear tabla `gemini_cache` en Supabase o eliminar referencias
3. Validar que `/api/healthcheck` muestre todas las keys como SET
4. Demo funcional para reunión con Enderson Leal (mañana)
