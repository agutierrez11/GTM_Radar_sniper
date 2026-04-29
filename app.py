import os
import time
import json

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
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


class StreamRequest(BaseModel):
    empresa_vende: str
    empresa_compra: str
    concepto_venta: str


def _sse(obj: dict) -> str:
    return f"data: {json.dumps(obj, ensure_ascii=False)}\n\n"


def _stream_generate(empresa_vende: str, empresa_compra: str, concepto_venta: str):
    from datetime import date
    try:
        from ddgs import DDGS
    except ImportError:
        yield _sse({"type": "research_done", "count": 0})
        DDGS = None

    year = date.today().year
    queries = [
        f"{empresa_compra} fintech que es modelo negocio",
        f"{empresa_compra} fundadores CEO historia",
        f"{empresa_compra} paises opera expansion latam",
        f"{empresa_compra} clientes segmentos mercado objetivo",
        f"{empresa_compra} producto plataforma tecnologia stack",
        f"{empresa_compra} {concepto_venta}",
        f"{empresa_compra} funding ronda inversion inversores {year} {year-1}",
        f"{empresa_compra} revenue crecimiento metricas",
        f"{empresa_compra} noticias {year}",
        f"{empresa_compra} alianzas partnerships integraciones",
        f"{empresa_compra} competidores alternativas",
        f"competidores de {empresa_compra} fintech latam",
        f"fintechs similares a {empresa_compra} latam",
        f"empresas como {empresa_compra} latam fintech",
        f"{empresa_compra} problemas desafios tecnicos operativos",
        f"{empresa_compra} {concepto_venta} integracion proveedor",
        f"{empresa_vende} {concepto_venta} latam",
        f"{empresa_vende} clientes casos de uso fintech",
    ]

    # Only keep results that mention at least one of the companies by name
    company_keywords = {empresa_compra.lower(), empresa_vende.lower()}

    def is_relevant(r: dict) -> bool:
        text = (r.get("title", "") + " " + r.get("body", "") + " " + r.get("href", "")).lower()
        return any(kw in text for kw in company_keywords)

    snippets = []
    seen_urls = set()

    if DDGS:
        try:
            with DDGS() as ddgs:
                for q in queries:
                    if len(snippets) >= 40:
                        break
                    try:
                        for r in ddgs.text(q, max_results=5):
                            if r["href"] not in seen_urls and is_relevant(r):
                                seen_urls.add(r["href"])
                                snippets.append(f"- [{r['title']}]({r['href']}): {r['body']}")
                                yield _sse({"type": "snippet", "title": r["title"], "url": r["href"], "body": r["body"]})
                    except Exception:
                        continue
                    time.sleep(0.25)
        except Exception:
            pass

    web_context = (
        "## CONTEXTO WEB (búsqueda reciente — usa esto para fundamentar el análisis)\n"
        + "\n".join(snippets[:40])
    ) if snippets else ""

    yield _sse({"type": "research_done", "count": len(snippets)})

    # ── modelo ──
    prompt = build_prompt(empresa_vende, empresa_compra, concepto_venta, web_context)
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=[{"role": "user", "content": prompt}],
            )
            markdown = clean_response(response.choices[0].message.content)
            yield _sse({"type": "done", "markdown": markdown})
            return
        except Exception as e:
            last_error = str(e)
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
    yield _sse({"type": "error", "error": last_error})



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
**Justificación:**

---

## 🧠 Hipótesis Forense

## 🔬 Fricción Técnica

## 💸 Dolor Financiero / Riesgo

---

## 🔬 Dossier de Estrategia
| Dimensión | Detalle |
|---|---|
| ⚙️ Fricción Operativa | |
| 🚨 Dolor Crítico | |
| 🎯 Resolución Táctica | |

---

## ⚔️ Plan de Ataque
**Schwerpunkt:**

**Flanqueo:**

**Apertura recomendada:**
> "..."

---

## 🧠 Auditoría
**⚠️ Abogado del Diablo:**

**🔍 Sesgo detectado:**

**Confianza general:** ALTA / MEDIA / BAJA

---

## 🔗 Lookalikes de {empresa_compra}
- Empresa — País — Por qué es similar

---

## ⚔️ Competidores de {empresa_compra}
- Empresa — País — Por qué compite

---

## 🌎 Mercados donde opera {empresa_compra}
- País

---

## 👥 Clientes de {empresa_compra}
- Segmento

---

## 💡 Propuesta de Valor de {empresa_compra}
-

---

## 📈 Latido del Mercado
**Tendencia:** ↑ Bullish / ↓ Bearish / ↔ Neutral

1.
2.
3.

---

## 🎯 Leads para {empresa_vende}
- Empresa — País — 🟢 LEAD / 🤝 SOCIO — Justificación
"""


def clean_response(text: str) -> str:
    """Strip any model preamble before the first markdown heading."""
    import re
    match = re.search(r"^##\s", text, re.MULTILINE)
    if match:
        return text[match.start():]
    return text


@app.post("/api/stream")
def stream(req: StreamRequest):
    return StreamingResponse(
        _stream_generate(req.empresa_vende, req.empresa_compra, req.concepto_venta),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


app.mount("/", StaticFiles(directory="static", html=True), name="static")
