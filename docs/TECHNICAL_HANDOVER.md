# 🛠️ TECHNICAL HANDOVER: SNIPER FACTORY V21.0
## Mapa de Ingeniería para Desarrolladores & Data Engineers

Este documento es el mapa para que un equipo técnico asuma el proyecto sin fricción. No te fijes en los cambios históricos; esta es la **Verdad Actual**.

---

### 1. Ubicación del Código y Estructura
- **Directorio Raíz:** `C:\Users\antonio\.gemini\antigravity\scratch/`
- **Frontend (Radar-GTM):** `/radar-gtm/` (Vanilla JS, CSS3, HTML5).
  - `app.js`: Motor de lógica, auth de titanes y llamadas a API.
  - `data.js`: Mock de titanes y configuración de webhooks.
- **Backend/Scripts (Python):** 
  - `orquestador_v6_stable.py`: El corazón del harvester (20 workers, silent mode).
  - `test_db.py` / `test_slack.py`: Pruebas de conectividad rápidas.
- **Configuración:** `.env` (Contiene llaves de Supabase, Slack y Firecrawl).

### 2. Capa de Datos (Supabase)
- **Acceso:** Vía HTTPS/REST (Puerto 443) para evitar bloqueos de VM.
- **Tablas Principales:**
  - `empresas`: Los 22,784 leads (El Universo).
  - `market_gaps`: Inteligencia extraída (Reddit/Blogs).
  - `relaciones`: Grafo de conexiones Competidor-Lead.

### 3. Stack de Escalabilidad (SaaS Productivo)
Para llevar esto a un SaaS empresarial, se requiere la siguiente migración:

#### **Perfiles Sugeridos (Fase 1: Founders Team)**
1. **Fullstack Developer (React/Next.js + Node.js):** Para migrar el frontend de Vanilla JS a una arquitectura escalable y segura.
2. **Data Engineer (Python/SQL):** Para optimizar la limpieza de los 22k leads y gestionar el flujo de Firecrawl.
3. **DevOps / Cloud Architect:** Para mover la VM de Google Cloud a un entorno de Kubernetes o Serverless (Vercel + Supabase Edge Functions).

#### **Stack Sugerido:**
- **Frontend:** Next.js (TailwindCSS para UI premium).
- **Capa de Tráfico:** Redis (Caching de resultados de scraping para no quemar créditos).
- **Inteligencia:** OpenAI/Anthropic API vía LangChain para el procesamiento de Battlecards.

### 4. Cómo leer este proyecto
1. **Punto de Inicio:** Lee el `.env` para entender las conexiones.
2. **El Motor:** Mira `orquestador_v6_stable.py`. Todo el flujo de entrada/salida de datos está ahí.
3. **La UI:** Abre `radar-gtm/index.html`. No tiene dependencias pesadas, corre directo en el navegador.

---
**NOTA PARA EL INGENIERO:** El sistema usa un "Silent Mode". No esperes ver miles de líneas en consola; el sistema escribe en archivos de log y manda alertas a Slack solo cuando hay hitos importantes para no saturar el overhead de comunicación.
