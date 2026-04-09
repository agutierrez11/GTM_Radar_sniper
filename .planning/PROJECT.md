# PROJECT: NERV Refactor (FastAPI + Next.js)

## Contexto
Refactorización de la plataforma GTM Intelligence "NERV" hacia una arquitectura limpia de Backend (FastAPI) y Frontend (Next.js). El backend de FastAPI absorberá y expondrá la lógica existente en `engine/`.

## Stack Tecnológico
- **Backend**: Python 3.14 + FastAPI
- **Frontend**: Next.js 15 (basado en nexus-poc)
- **Database**: Supabase (PostgreSQL + pgvector)
- **Data Layer**: Integración directa de `engine/` en la API.
- **Infra**: Vercel (Front) + Docker/Cloud Run (Back).

## Objetivos Principales
1. Unificar los scripts de `engine/` en una API robusta con FastAPI.
2. Migrar `nexus-poc` a la carpeta de Frontend definitiva (`apps/frontend`).
3. Eliminar la dependencia de Node en el servidor (mantener solo para el front).
4. Asegurar que el esquema de 37 campos de NERV sea la base de los modelos de Pydantic en FastAPI.

## Convenciones
- **Commits**: Conventional Commits.
- **Arquitectura**: Clean Architecture / Router-Service-Repository (en FastAPI).
- **Testing**: Pytest (Back) + Vitest (Front).
