# Research: Codebase Audit (March 2026)

## Hallazgos
1. **Engine (Python)**: Está muy maduro. No tiene sentido reescribirlo. Se debe integrar como un servicio o via ejecución de procesos.
2. **Nexus-POC (Next.js)**: Tiene componentes de Three.js y lógica de AI integrada. Es el mejor punto de partida para la UI.
3. **Server Actual (Node)**: En `server/` ya hay una base de Express con tRPC. Hay que decidir si mantenemos tRPC o vamos a REST puro para simplificar la integración con otros servicios.
4. **Data**: El esquema de `empresas_v3` en Supabase es el norte. Todo el backend debe girar en torno a este esquema de 37 campos.

## Riesgos
- Latencia en la orquestación de scripts de Python.
- Complejidad en la migración de tipos de TypeScript si no se usa un monorepo.
