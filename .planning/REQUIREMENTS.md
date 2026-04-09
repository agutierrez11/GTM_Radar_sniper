# REQUIREMENTS: NERV Refactor (FastAPI + Next.js)

## 1. Functional Requirements
- **FR1: API Gateway (FastAPI)**: Debe exponer la lógica de `engine/` mediante endpoints:
  - Listar empresas (con filtros por país, vertical, tier).
  - Búsqueda semántica (similarity search con pgvector via SQLAlchemy/PostgreSQL).
  - Obtener el perfil de 37 campos de una empresa (Modelos Pydantic).
  - Disparar el flujo de enriquecimiento (Background Tasks de FastAPI).
- **FR2: Frontend (Next.js)**: Una interfaz moderna basada en `nexus-poc` que permita:
  - Dashboard de visualización de datos (gráficos, mapas).
  - Búsqueda inteligente por lenguaje natural (RAG).
  - Gestión de colas de enriquecimiento (integrado con el Back).
- **FR3: Unified Python Layer**: La API debe importar y usar directamente los módulos de `engine/` (sin subprocesos).
- **FR4: Supabase Integration**: Persistencia y Auth usando Supabase.

## 2. Non-Functional Requirements
- **NFR1: Performance**: FastAPI es asíncrono, las búsquedas semánticas deben responder en < 150ms.
- **NFR2: Scalability**: Uso de `asyncio` para manejar múltiples llamadas a Gemini/Firecrawl concurrentemente.
- **NFR3: DX (Developer Experience)**: Estructura clara `apps/frontend` y `apps/backend` (que contiene `engine/`).
- **NFR4: Type Safety**: Uso estricto de Pydantic V2 para validación de esquemas.
