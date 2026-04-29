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
    # Tuples of (query, apply_company_filter)
    queries = [
        # Perfil general
        (f"{empresa_compra} fintech que es modelo negocio", True),
        (f"{empresa_compra} fundadores CEO historia", True),
        (f"{empresa_compra} crunchbase funding investors", True),
        (f"{empresa_compra} linkedin empresa perfil", True),
        # Mercados y clientes
        (f"{empresa_compra} paises opera expansion latam", True),
        (f"{empresa_compra} clientes segmentos mercado objetivo", True),
        (f"{empresa_compra} casos de uso clientes referencias {year}", True),
        # Producto y propuesta de valor
        (f"{empresa_compra} producto plataforma tecnologia stack", True),
        (f"{empresa_compra} {concepto_venta}", True),
        (f"{empresa_compra} proveedores tecnologia integraciones api", True),
        (f"{empresa_compra} {concepto_venta} proveedor actual procesador", True),
        # Funding y métricas
        (f"{empresa_compra} funding ronda inversion inversores {year} {year-1}", True),
        (f"{empresa_compra} revenue crecimiento metricas ARR", True),
        # Noticias y señales
        (f"{empresa_compra} noticias {year}", True),
        (f"{empresa_compra} press release comunicado {year}", True),
        (f"{empresa_compra} expansion nuevos mercados {year}", True),
        (f"{empresa_compra} alianzas partnerships integraciones", True),
        # Competidores y lookalikes
        (f"{empresa_compra} competidores alternativas", True),
        (f"competidores de {empresa_compra} fintech latam", True),
        (f"fintechs similares a {empresa_compra} latam", True),
        (f"empresas como {empresa_compra} latam fintech", True),
        (f"site:latamfintech.co {empresa_compra}", True),
        (f"site:finnovista.com {empresa_compra}", True),
        # Ecosystem queries — no filtrar por empresa, capturan lookalikes del sector
        (f"{concepto_venta} latam fintechs empresas startups", False),
        (f"{concepto_venta} latam proveedores competidores ecosistema", False),
        (f"{concepto_venta} latam 2025 tendencias mercado", False),
        (f"{concepto_venta} startups latam crunchbase 2024 2025", False),
        (f"fintech latam {concepto_venta} lista empresas directorio", False),
        # Dolor y fricción
        (f"{empresa_compra} problemas desafios tecnicos operativos", True),
        (f"{empresa_compra} {concepto_venta} integracion desafio", True),
        (f"{empresa_compra} downtime incidente falla {year}", True),
        (f"{empresa_compra} regulacion compliance riesgo", True),
        (f"{empresa_compra} migracion cambio proveedor tecnologia", True),
        # Señales de compra y timing
        (f"{empresa_compra} licitacion contrato proveedor {year}", True),
        (f"{empresa_compra} job opening CTO engineering {year}", True),
        (f"{empresa_compra} hiring tecnologia infraestructura {year}", True),
        # Contexto del vendedor — más variantes
        (f"{empresa_vende} {concepto_venta} latam clientes", True),
        (f"{empresa_vende} casos de uso fintech {concepto_venta}", True),
        (f"{empresa_vende} {empresa_compra}", True),
        (f"{empresa_vende} integraciones api {concepto_venta} latam", True),
        (f"site:linkedin.com {empresa_compra} {concepto_venta}", True),
        (f"site:linkedin.com {empresa_compra} proveedor tecnologia", True),
    ]

    company_keywords = {empresa_compra.lower(), empresa_vende.lower()}

    def is_relevant(r: dict, apply_filter: bool) -> bool:
        if not apply_filter:
            return True
        text = (r.get("title", "") + " " + r.get("body", "") + " " + r.get("href", "")).lower()
        return any(kw in text for kw in company_keywords)

    snippets = []
    seen_urls = set()

    if DDGS:
        try:
            with DDGS() as ddgs:
                for q, apply_filter in queries:
                    if len(snippets) >= 50:
                        break
                    try:
                        for r in ddgs.text(q, max_results=7):
                            if r["href"] not in seen_urls and is_relevant(r, apply_filter):
                                seen_urls.add(r["href"])
                                snippets.append({"title": r["title"], "url": r["href"], "body": r["body"]})
                                yield _sse({"type": "snippet", "title": r["title"], "url": r["href"], "body": r["body"]})
                    except Exception:
                        continue
                    time.sleep(0.25)
        except Exception:
            pass

    # ── fetch full page content in parallel ──
    import httpx
    from bs4 import BeautifulSoup
    from concurrent.futures import ThreadPoolExecutor, as_completed

    FETCH_TIMEOUT = 5
    MAX_CHARS   = 3000

    def _fetch_text(url: str) -> str:
        try:
            resp = httpx.get(
                url,
                timeout=FETCH_TIMEOUT,
                follow_redirects=True,
                headers={"User-Agent": "Mozilla/5.0 (compatible; GTMIntel/1.0)"},
            )
            if resp.status_code != 200:
                return ""
            ct = resp.headers.get("content-type", "")
            if "html" not in ct:
                return ""
            soup = BeautifulSoup(resp.text, "html.parser")
            for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
                tag.decompose()
            text = " ".join(soup.get_text(" ", strip=True).split())
            return text[:MAX_CHARS]
        except Exception:
            return ""

    # Fetch all URLs in parallel (max 10 workers)
    fetched = {}
    with ThreadPoolExecutor(max_workers=10) as pool:
        future_to_s = {pool.submit(_fetch_text, s["url"]): s for s in snippets}
        for future in as_completed(future_to_s):
            s = future_to_s[future]
            fetched[s["url"]] = future.result()

    context_lines = []
    for s in snippets:
        full = fetched.get(s["url"], "")
        if full:
            context_lines.append(f"[{s['title']}]({s['url']}):\n{full}")
        else:
            context_lines.append(f"[{s['title']}]({s['url']}): {s['body']}")

    web_context = (
        "## CONTEXTO WEB\n"
        + "\n\n".join(context_lines)
    ) if context_lines else ""

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
        "1. SOLO puedes usar la información del '## CONTEXTO WEB' que está al inicio de este mensaje. "
        "NO uses tu conocimiento de entrenamiento para afirmar hechos sobre las empresas. "
        "Si un dato no está en el contexto web, escribe explícitamente 'No encontré información sobre esto en las fuentes.' "
        "Cita siempre la URL fuente entre paréntesis al lado del dato."
    ) if web_context else (
        "1. No tienes contexto web disponible para este análisis. Indica explícitamente qué datos son de tu conocimiento de entrenamiento y cuáles no pudiste verificar."
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
