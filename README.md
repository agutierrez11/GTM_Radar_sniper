# NERV — GTM Intelligence Platform (FastAPI + Next.js 15)

## 🚀 Overview
NERV es una plataforma de inteligencia de ventas (GTM) diseñada para el ecosistema Fintech LATAM. Utiliza un **Swarm de Agentes de IA** y **RAG (Retrieval-Augmented Generation)** para transformar datos crudos en perfiles estratégicos de calidad McKinsey (37 campos por empresa).

---

## 🏗️ Nueva Arquitectura (v2.0)

La plataforma ha sido refactorizada hacia una arquitectura limpia y modular:

- **Frontend (`apps/frontend`)**: Next.js 15 (Basado en `nexus-poc`). Interfaz de usuario reactiva, visualizaciones 3D (Three.js/Globe) y dashboard de inteligencia.
- **Backend (`apps/backend`)**: FastAPI (Python 3.14). Motor de IA unificado que integra la lógica original del `engine/`. Gestiona:
  - Swarm de Agentes (Harvester, Challenger, Synthesizer).
  - Búsqueda Semántica asíncrona (pgvector).
  - Enriquecimiento de datos en segundo plano.
- **Database**: Supabase (PostgreSQL + pgvector). Fuente de verdad única para Datos y Auth.

---

## 🛠️ Instalación y Setup Local

### 1. Requisitos
- Node.js (v18+)
- pnpm (`npm install -g pnpm`)
- Python 3.14+

### 2. Configuración de Entorno
Copia el archivo `.env.example` en la raíz como `.env` y rellena las credenciales estratégicas (Supabase, Gemini, Firecrawl, Tavily):
```bash
cp .env.example .env
```

### 3. Instalación de Dependencias
```bash
# Frontend (Root)
pnpm install

# Backend (FastAPI)
cd apps/backend
pip install -r requirements.txt
```

---

## 🐳 Ejecución en Docker (Contenedores)

Para un entorno de producción o pruebas aislado, puedes usar Docker Compose:

- **Linux/Mac**: `./run_docker.sh`
- **Windows**: `run_docker.bat`

O manualmente:
```bash
docker compose up --build -d
```

---

## 🗺️ Roadmap de Datos
- **Fase 1-4 [COMPLETED]**: Refactorización a monorepo, FastAPI Core, Swarm Integration, pgvector RAG.
- **Fase 5 [COMPLETED]**: Cleanup, Handover & Documentation.

**NERV Intelligence Protocol — Antonio Gutiérrez — March 2026**
