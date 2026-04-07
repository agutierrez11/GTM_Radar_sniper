# /kb-audit — Audita el Knowledge Base de NERV

## Propósito
Corre kb_quality_layer.py sobre todos los archivos del knowledge_base y reporta qué datos son confiables para usar en demos y reuniones.

## Cuándo usar
- Antes de una reunión importante (Galileo, Enderson, etc.)
- Antes de embedear nuevos documentos
- Después de agregar archivos al KB
- Semanalmente como higiene de datos

## Comando
```bash
cd engine
python kb_quality_layer.py
```

Para auditar JSON específico:
```bash
python kb_quality_layer.py json ../nexus-poc/knowledge_base/casinos_latam_185.json
```

## Interpretación de resultados
- ✅ BAJO — seguro para usar en demos y pitch
- ⚠️  MEDIO — usar con precaución, mencionar la fuente
- 🔴 ALTO — no citar en reuniones sin verificar primero
- 🚨 CRÍTICO — NO usar, datos generados por template o reporte sesgado

## Regla de oro
Si no puedes responder "¿de dónde viene este dato?" en 10 segundos, es [NO_VERIFICADO].
