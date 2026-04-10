import os
import time

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from google import genai
from google.genai import types
from google.genai.errors import ServerError

API_KEY = os.environ.get("GEMINI_API_KEY", "")
client = genai.Client(api_key=API_KEY)

MAX_RETRIES = 5
RETRY_DELAY = 10

app = FastAPI()


class AnalysisRequest(BaseModel):
    empresa_vende: str
    empresa_compra: str
    concepto_venta: str


def build_prompt(empresa_vende: str, empresa_compra: str, concepto_venta: str) -> str:
    return f"""
Eres un analista de inteligencia comercial especializado en fintechs latinoamericanas.
Contexto de venta: {empresa_vende} quiere vender {concepto_venta} a {empresa_compra}.

REGLAS ABSOLUTAS:
1. Usa Google Search activamente para encontrar información actualizada. No te limites a lo que ya sabes.
2. En todas las secciones de listas (lookalikes, competidores, leads, mercados, clientes) sé EXHAUSTIVO: busca y lista TODOS los que puedas encontrar, no solo los más famosos. Un comercial no puede descubrir después que faltaron actores relevantes.
3. Detalle ≠ verborrea. En las secciones narrativas sé conciso. En las listas sé completo.
4. Para lookalikes y leads: busca explícitamente en fuentes como Latamfintech, Finnovista, F10, CB Insights, Crunchbase, LinkedIn, noticias recientes. No pares en los primeros 5 resultados.
5. Nunca digas "entre otros" o "etc." — si no encontraste más, dilo explícitamente.
6. CRÍTICO — ENFOQUE DE PRODUCTO: Todo el análisis (hipótesis, dolor, plan de ataque, apertura, dossier) debe estar 100% anclado en "{concepto_venta}". No menciones, sugieras ni impliques otros productos o capacidades de {empresa_vende} fuera de "{concepto_venta}". Si el análisis no puede conectarse directamente con "{concepto_venta}", no lo incluyas.

Investiga a fondo a {empresa_compra} y devuelve tu análisis SIEMPRE en el siguiente formato estructurado, enfocado en cómo {empresa_vende} puede ganar esta cuenta vendiendo específicamente "{concepto_venta}". No omitas ninguna sección.

---

## ⚖️ Veredicto de Relación: {empresa_vende} → {empresa_compra}
**Clasificación:** 🟢 LEAD / 🤝 SOCIO/ALIANZA / 🔴 COMPETENCIA
**Justificación:** (en 2-3 líneas: por qué es esa relación y no otra, considerando el {concepto_venta})

---

## 🧠 Hipótesis Forense
(Por qué {empresa_compra} necesitaría hoy lo que ofrece {empresa_vende}: tensiones internas, movimiento estratégico probable)

## 🔬 Fricción Técnica
(El principal cuello de botella técnico u operativo de {empresa_compra} que {concepto_venta} podría resolver)

## 💸 Dolor Financiero / Riesgo
(El riesgo financiero o competitivo más crítico de {empresa_compra} hoy)

---

## 🔬 Dossier de Estrategia
| Dimensión | Detalle |
|---|---|
| ⚙️ Fricción Operativa | ... |
| 🚨 Dolor Crítico | ... |
| 🎯 Resolución Táctica | cómo {empresa_vende} resuelve esto con {concepto_venta} |

---

## ⚔️ Plan de Ataque
**Schwerpunkt** (foco principal para que {empresa_vende} entre en {empresa_compra}):
...

**Flanqueo** (ángulo secundario de entrada):
...

**Apertura recomendada** (frase de entrada para la primera reunión):
> "..."

---

## 🧠 Auditoría
**⚠️ Abogado del Diablo:**
...

**🔍 Sesgo detectado:**
...

**Confianza general:** ALTA / MEDIA / BAJA

---

## 🔗 Lookalikes de {empresa_compra}
(Empresas similares a {empresa_compra} — mismo modelo, mismo mercado, mismo problema. Sé exhaustivo, busca en Latamfintech, Finnovista, Crunchbase, LinkedIn y noticias. No uses "etc.")
- Empresa — País — Por qué es similar a {empresa_compra}

---

## ⚔️ Competidores de {empresa_compra}
(Competidores directos de {empresa_compra})
- Empresa — País — Por qué compite

---

## 🌎 Mercados donde opera {empresa_compra}
- País

---

## 👥 Clientes de {empresa_compra}
(Segmentos que atiende)
- Segmento

---

## 💡 Propuesta de Valor de {empresa_compra}
- ...

---

## 📈 Latido del Mercado
**Tendencia:** ↑ Bullish / ↓ Bearish / ↔ Neutral

(3 señales recientes relevantes para la venta, con fuente y fecha aproximada)
1. ...
2. ...
3. ...

---

## 🎯 Leads para {empresa_vende}
(Empresas a las que {empresa_vende} debería llamar — incluye los lookalikes de {empresa_compra} y otras cuentas del ecosistema. EXCLUYE cualquier empresa que compita directamente con {empresa_vende}. Clasifica cada una solo como 🟢 LEAD o 🤝 SOCIO/ALIANZA. Sé exhaustivo.)
- Empresa — País — 🟢 LEAD / 🤝 SOCIO — Justificación
"""


@app.post("/api/analyze")
async def analyze(req: AnalysisRequest):
    prompt = build_prompt(req.empresa_vende, req.empresa_compra, req.concepto_venta)
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())]
                ),
            )
            return {"markdown": response.text}
        except ServerError as e:
            last_error = str(e)
            if "503" in str(e) and attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
            else:
                break

    return JSONResponse(status_code=503, content={"error": last_error})


app.mount("/", StaticFiles(directory="static", html=True), name="static")
