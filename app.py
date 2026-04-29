import os
import time

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import OpenAI

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "tencent/hy3-preview:free")

client = OpenAI(
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


def _web_research(empresa_vende: str, empresa_compra: str, concepto_venta: str) -> str:
    """Run DuckDuckGo searches covering every dossier section and return a context block."""
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        return ""

    from datetime import date
    year = date.today().year

    queries = [
        # Perfil general
        f"{empresa_compra} fintech que es modelo negocio",
        f"{empresa_compra} fundadores CEO historia",
        # Mercados y clientes
        f"{empresa_compra} paises opera expansion latam",
        f"{empresa_compra} clientes segmentos mercado objetivo",
        # Producto y propuesta de valor
        f"{empresa_compra} producto plataforma tecnologia stack",
        f"{empresa_compra} {concepto_venta}",
        # Funding e inversores
        f"{empresa_compra} funding ronda inversion inversores {year} {year-1}",
        f"{empresa_compra} revenue crecimiento metricas",
        # Noticias recientes y señales de mercado
        f"{empresa_compra} noticias {year}",
        f"{empresa_compra} alianzas partnerships integraciones",
        # Competidores
        f"{empresa_compra} competidores alternativas",
        f"competidores de {empresa_compra} fintech latam",
        # Lookalikes — empresas similares en LATAM
        f"fintechs similares a {empresa_compra} latam",
        f"empresas como {empresa_compra} latam fintech",
        # Dolor / fricción técnica
        f"{empresa_compra} problemas desafios tecnicos operativos",
        f"{empresa_compra} {concepto_venta} integracion proveedor",
        # Contexto del vendedor
        f"{empresa_vende} {concepto_venta} latam",
        f"{empresa_vende} clientes casos de uso fintech",
    ]

    snippets = []
    seen_urls = set()
    try:
        with DDGS() as ddgs:
            for q in queries:
                try:
                    for r in ddgs.text(q, max_results=4, timelimit="y"):
                        if r["href"] not in seen_urls:
                            seen_urls.add(r["href"])
                            snippets.append(f"- [{r['title']}]({r['href']}): {r['body']}")
                except Exception:
                    continue
    except Exception:
        return ""

    if not snippets:
        return ""

    return "## CONTEXTO WEB (búsqueda reciente — usa esto para fundamentar el análisis)\n" + "\n".join(snippets[:40])


def build_prompt(empresa_vende: str, empresa_compra: str, concepto_venta: str, web_context: str = "") -> str:
    ctx_block = f"\n\n{web_context}\n\n---\n" if web_context else ""
    ctx_instruction = (
        "1. TIENES ACCESO A RESULTADOS DE BÚSQUEDA WEB REALES inyectados al inicio de este mensaje bajo '## CONTEXTO WEB'. "
        "Úsalos como tu FUENTE PRIMARIA. Cita datos concretos de esos resultados (nombres, fechas, cifras, URLs). "
        "Si un dato del contexto web contradice tu conocimiento previo, prioriza el contexto web."
    ) if web_context else (
        "1. Usa tu conocimiento interno sobre el ecosistema fintech latinoamericano. Sé específico con datos reales conocidos."
    )
    return f"""{ctx_block}
Eres un analista de inteligencia comercial especializado en fintechs latinoamericanas.
Contexto de venta: {empresa_vende} quiere vender {concepto_venta} a {empresa_compra}.

REGLAS ABSOLUTAS:
{ctx_instruction}
2. En todas las secciones de listas (lookalikes, competidores, leads, mercados, clientes) sé EXHAUSTIVO: lista TODOS los que puedas identificar, no solo los más famosos. Un comercial no puede descubrir después que faltaron actores relevantes.
3. Detalle ≠ verborrea. En las secciones narrativas sé conciso. En las listas sé completo.
4. Para lookalikes y leads: busca en el contexto web y en tu conocimiento de Latamfintech, Finnovista, F10, CB Insights, Crunchbase, LinkedIn. No pares en los primeros 5.
5. Nunca digas "entre otros" o "etc." — si no encontraste más, dilo explícitamente.
6. CRÍTICO — ENFOQUE DE PRODUCTO: Todo el análisis debe estar 100% anclado en "{concepto_venta}". No menciones otros productos o capacidades de {empresa_vende} fuera de "{concepto_venta}".

Investiga a fondo a {empresa_compra} y devuelve tu análisis SIEMPRE en el siguiente formato estructurado. No omitas ninguna sección.

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
    web_context = _web_research(req.empresa_vende, req.empresa_compra, req.concepto_venta)
    prompt = build_prompt(req.empresa_vende, req.empresa_compra, req.concepto_venta, web_context)
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
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
