# /build — Implementación incremental con validación

## Propósito
Ejecutar el plan tarea por tarea, verificando cada paso antes de continuar. No saltar pasos.

## Proceso
1. Leer el archivo completo antes de editarlo
2. Hacer el cambio mínimo necesario
3. Verificar que el cambio cumple el criterio de éxito
4. Reportar resultado antes de pasar a la siguiente tarea

## Reglas críticas para NERV
- NUNCA tocar empresas_v3 en Supabase sin respaldo
- NUNCA embedear datos sin pasar por kb_quality_layer.pre_ingest_gate()
- NUNCA modificar el schema de Supabase sin spec aprobado
- Si algo falla, PARAR y reportar — no intentar arreglarlo sobre la marcha

## Checklist pre-commit
- [ ] El archivo pasa linting (no errores de sintaxis)
- [ ] La función tiene manejo de excepciones
- [ ] No hay credenciales hardcodeadas
- [ ] Si toca KB: pasó por kb_quality_layer
