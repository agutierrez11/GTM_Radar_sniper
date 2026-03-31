# NERV: Guardrails de Ejecución (GR)

Reglas operativas que los agentes de NERV deben verificar en cada sesión.

## GR-01: Verificación de Entidad
MANDATORIO: Antes de insertar una empresa en `empresas_v2`, se debe verificar su sitio web oficial.

## GR-02: Consenso de Sentimiento
RECOMENDADO: El sentimiento (Bullish/Bearish) debe ser validado por al menos dos modelos (ej: DeepSeek + Gemini).

## GR-03: Cita de Fuentes
MANDATORIO: Todo `Surgical Strike` debe incluir la fuente de la señal que disparó la oportunidad.

## GR-04: Filtro de Competencia
MANDATORIO: Identificar al menos un competidor directo en el país de destino para cada prospecto sugerido.
