import os
import time
from typing import Literal

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import OpenAI

ALIBABA_API_KEY = os.environ.get("ALIBABA_API_KEY", "")
QWEN_BASE_URL = os.environ.get(
    "QWEN_BASE_URL", "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
)
QWEN_MODEL = os.environ.get("QWEN_MODEL", "qwen3.6-plus")

qwen_client = OpenAI(
    api_key=ALIBABA_API_KEY,
    base_url=QWEN_BASE_URL,
)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "tencent/hy3-preview:free")

openrouter_client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url=OPENROUTER_BASE_URL,
)

MAX_RETRIES = 5
RETRY_DELAY = 10

app = FastAPI()


class AnalysisRequest(BaseModel):
    empresa_vende: str
    empresa_compra: str
    concepto_venta: str
    provider: Literal["qwen", "openrouter"] = "qwen"


def _web_research(empresa_compra: str, concepto_venta: str) -> str:
    """Run DuckDuckGo searches and return a context block to inject into the prompt."""
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        return ""

    queries = [
        f"{empresa_compra} empresa fintech",
        f"{empresa_compra} {concepto_venta}",
        f"{empresa_compra} noticias 2025",
        f"{empresa_compra} competitors funding investors",
    ]

    snippets = []
    try:
        with DDGS() as ddgs:
            for q in queries:
                try:
                    for r in ddgs.text(q, max_results=5, timelimit="y"):
                        line = f"- [{r['title']}]({r['href']}): {r['body']}"
                        if line not in snippets:
                            snippets.append(line)
                except Exception:
                    continue
    except Exception:
        return ""

    if not snippets:
        return ""

    return "## CONTEXTO WEB (búsqueda reciente)\n" + "\n".join(snippets[:20])


def build_prompt(empresa_vende: str, empresa_compra: str, concepto_venta: str, web_context: str = "") -> str:
    ctx_block = f"\n\n{web_context}\n\n---\n" if web_context else ""
    return f"""{ctx_block}
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


def clean_response(text: str) -> str:
    """Strip any model preamble before the first markdown heading."""
    import re
    match = re.search(r"^##\s", text, re.MULTILINE)
    if match:
        return text[match.start():]
    return text


@app.post("/api/analyze")
async def analyze(req: AnalysisRequest):
    web_context = _web_research(req.empresa_compra, req.concepto_venta)
    prompt = build_prompt(req.empresa_vende, req.empresa_compra, req.concepto_venta, web_context)
    if req.provider == "openrouter":
        return _run_openrouter(prompt)
    return _run_qwen(prompt)


def _run_qwen(prompt: str):
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = qwen_client.chat.completions.create(
                model=QWEN_MODEL,
                messages=[{"role": "user", "content": prompt}],
                extra_body={"enable_search": True},
            )
            return {"markdown": clean_response(response.choices[0].message.content)}
        except Exception as e:
            last_error = str(e)
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
            else:
                break
    return JSONResponse(status_code=503, content={"error": last_error})


def _run_openrouter(prompt: str):
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = openrouter_client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=[{"role": "user", "content": prompt}],
            )
            return {"markdown": clean_response(response.choices[0].message.content)}
        except Exception as e:
            last_error = str(e)
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
            else:
                break
    return JSONResponse(status_code=503, content={"error": last_error})


app.mount("/", StaticFiles(directory="static", html=True), name="static")
