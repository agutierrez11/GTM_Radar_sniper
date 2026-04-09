# ROADMAP: NERV Refactor (FastAPI + Next.js)

## Phase 1: Workspace Setup & Cleanroom [COMPLETED]
- [x] Reestructurar carpetas: `apps/frontend` (Next.js 15) y `apps/backend` (FastAPI + Engine).
- [x] Configurar un `pyproject.toml` (o `requirements.txt`) unificado para el backend.
- [x] Unificar variables de entorno (.env).

## Phase 2: Backend Core (FastAPI) [COMPLETED]
- [x] Inicializar servidor FastAPI con soporte asíncrono.
- [x] Mergear scripts de `engine/` en la estructura de FastAPI (convertir scripts en servicios).
- [x] Configurar cliente de Supabase asíncrono en Python.
- [x] Definir modelos Pydantic para el esquema de 37 campos (McKinsey Profile).

## Phase 3: Frontend Migration (Next.js 15) [COMPLETED]
- [x] Mover lógica de `nexus-poc` a `apps/frontend`.
- [x] Refactorizar componentes de AI para consumir la nueva API de FastAPI.
- [x] Asegurar compatibilidad de Three.js y animaciones en la nueva estructura.

## Phase 4: Data & Integration [COMPLETED]
- [x] Validar el flujo de datos: `FastAPI (Enrich module) -> Supabase -> FastAPI API -> Next.js UI`.
- [x] Pruebas de integración para la búsqueda semántica asíncrona.
- [x] Auditoría de seguridad (SOP_SEGURIDAD_SUPABASE.md).

## Phase 5: Final Cleanup & Handover [COMPLETED]
- [x] Eliminar archivos basura, carpetas temporales y el `server/` de Node innecesario.
- [x] Documentar el flujo de despliegue (Vercel + Cloud Run/Docker).
