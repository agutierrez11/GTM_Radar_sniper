# /review — Control de calidad antes de considerar algo listo

## Propósito
Revisar el código contra el plan original. Si hay desviaciones, reportarlas antes de marcar como completo.

## Checklist NERV

### Engine (Python)
- [ ] No hay doble __main__ block
- [ ] Variables de entorno via os.getenv(), nunca hardcodeadas
- [ ] Manejo de errores con try/except y logging
- [ ] Datos que van a Supabase pasaron por kb_quality_layer
- [ ] No hay print() en código de producción — usar logging

### Frontend (TypeScript/Next.js)
- [ ] No hay console.log() sin borrar
- [ ] Las API routes tienen manejo de errores
- [ ] No hay API keys en el código cliente

### Datos
- [ ] JSON con arrays de empresas revisado con audit_json_file()
- [ ] Archivos .md del KB auditados con audit_kb_directory()
- [ ] Datos con [SESGO_FUENTE] o [NO_VERIFICADO] marcados explícitamente

## Severidades
- CRÍTICO: bloquea merge — datos corruptos, credenciales expuestas
- ALTO: debe resolverse antes de usar en demo/reunión
- MEDIO: documentar como deuda técnica
- BAJO: mejora futura
