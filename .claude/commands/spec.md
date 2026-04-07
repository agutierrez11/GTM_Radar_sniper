# /spec — Define qué construir antes de escribir código

## Propósito
Antes de escribir una sola línea de código, define el qué, el por qué y los criterios de éxito. Obligatorio para cualquier feature nueva en NERV.

## Proceso
1. Haz preguntas socráticas para entender el problema real
2. Define el objetivo en una oración
3. Lista los criterios de éxito (cómo sabemos que está listo)
4. Identifica los archivos que se van a tocar
5. Detecta riesgos y dependencias
6. Obtén confirmación antes de continuar a /plan

## Preguntas clave para NERV
- ¿Esto afecta el pipeline de ingesta, el KB, el frontend o el RAG?
- ¿Hay datos en Supabase que podrían corromperse?
- ¿Qué pasa si esto falla en producción (Vercel)?
- ¿Necesita pasar por kb_quality_layer.py antes de tocar la DB?

## Formato de output
```
OBJETIVO: [Una oración]
CRITERIOS DE ÉXITO:
  - [ ] ...
ARCHIVOS AFECTADOS:
  - engine/...
  - nexus-poc/src/...
RIESGOS:
  - ...
```

No proceder a /plan sin confirmación explícita del usuario.
