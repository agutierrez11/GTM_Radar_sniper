# /plan — Planifica tareas atómicas de 2-5 minutos

## Propósito
Convierte el spec en tareas ejecutables, específicas y ordenadas. Cada tarea debe ser tan pequeña que si falla, se puede revertir sin dañar el resto.

## Reglas para NERV
- Cada tarea toca UN archivo a la vez
- Si una tarea toca Supabase, incluir rollback plan
- Las tareas de engine/ van antes que las de nexus-poc/src/
- Siempre incluir tarea de verificación al final

## Formato de tarea
```
TAREA N: [Verbo + archivo + qué hace]
  Archivo: engine/kb_quality_layer.py
  Tipo: CREATE | EDIT | DELETE | RUN
  Test: cómo verifico que funcionó
  Rollback: cómo deshago si falla
```

## Orden estándar en NERV
1. Engine (Python) — lógica de datos
2. Lib (TypeScript) — utilidades frontend
3. API routes — endpoints
4. Components — UI
5. Verificación end-to-end
