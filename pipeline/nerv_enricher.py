import os
import json
import asyncio
import aiohttp
import pandas as pd
import re
import csv
from datetime import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types

# ── Config ────────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), ".env.local"))

GEMINI_KEYS  = [k for k in [os.getenv(f"GEMINI_API_KEY_{i}") for i in range(1,4)] if k]
if not GEMINI_KEYS:
    raise ValueError("Necesitas GEMINI_API_KEY_1 en .env.local")

GEMINI_MODEL = "gemini-2.5-flash"  # calidad máxima, billing habilitado

FIRECRAWL_KEY = os.getenv("FIRECRAWL_API_KEY")
TAVILY_KEYS   = [k for k in [os.getenv(f"TAVILY_API_KEY{s}") for s in ["", "_2"]] if k]
CSV_SOURCE    = os.getenv("CSV_SOURCE", r"C:\Users\Antonio\Desktop\NERV_MASTER_VERIFIED.csv")
OUTPUT_CSV    = os.getenv("LOG_PATH",   r"C:\Users\Antonio\Desktop\NERV_ENRICHED_OUTPUT.csv")

DELAY_SECONDS = 1
gemini_clients = [genai.Client(api_key=k) for k in GEMINI_KEYS]
_rr = 0
_trr = 0  # Tavily round robin

REGULATORS = {
    "mexico":"CNBV, Banxico, CONDUSEF","méxico":"CNBV, Banxico, CONDUSEF",
    "colombia":"SFC (Superintendencia Financiera de Colombia), Banco de la República",
    "chile":"CMF (Comisión para el Mercado Financiero), Banco Central de Chile",
    "brasil":"BACEN (Banco Central do Brasil), CVM","brazil":"BACEN (Banco Central do Brasil), CVM",
    "peru":"SBS (Superintendencia de Banca, Seguros y AFP), BCRP",
    "perú":"SBS (Superintendencia de Banca, Seguros y AFP), BCRP",
    "argentina":"BCRA (Banco Central de la República Argentina), CNV",
    "uruguay":"BCU (Banco Central del Uruguay)","chile":"CMF",
    "paraguay":"BCP (Banco Central del Paraguay)",
    "bolivia":"BCB (Banco Central de Bolivia)",
}

# ── Gemini ────────────────────────────────────────────────────
async def call_gemini(prompt: str) -> str | None:
    global _rr
    for attempt in range(len(gemini_clients)):
        idx = (_rr + attempt) % len(gemini_clients)
        client = gemini_clients[idx]
        try:
            resp = await asyncio.to_thread(
                client.models.generate_content,
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.05
                )
            )
            _rr = idx + 1
            return resp.text
        except Exception as e:
            err = str(e)
            if "429" in err or "RESOURCE_EXHAUSTED" in err:
                print(f"      Key {idx+1} agotada, rotando...")
                continue
            if "503" in err or "UNAVAILABLE" in err:
                print(f"      Gemini sobrecargado (key {idx+1}), reintentando en 10s...")
                await asyncio.sleep(10)
                continue
            print(f"      Gemini error (key {idx+1}): {e}")
            return None
    # Todas las keys en 429 — espera 35s y reintenta con key 1
    print("      Todas las keys en límite — esperando 35s...")
    await asyncio.sleep(35)
    try:
        resp = await asyncio.to_thread(
            gemini_clients[0].models.generate_content,
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.05
            )
        )
        _rr = 1
        return resp.text
    except Exception as e:
        print(f"      Gemini error final: {e}")
        return None

# ── Embedding ─────────────────────────────────────────────────
async def get_embedding(text: str) -> list | None:
    if not text: return None
    try:
        client = gemini_clients[0]
        result = await asyncio.to_thread(
            client.models.embed_content,
            model="gemini-embedding-001",
            contents=text
        )
        return list(result.embeddings[0].values)[:768]
    except Exception as e:
        print(f"      Embedding error: {e}")
        return None

# ── Firecrawl scrape ──────────────────────────────────────────
async def tavily_signals(name: str, session: aiohttp.ClientSession) -> str:
    global _trr
    if not TAVILY_KEYS:
        return ""
    key = TAVILY_KEYS[_trr % len(TAVILY_KEYS)]
    _trr += 1
    try:
        async with session.post(
            "https://api.tavily.com/search",
            json={
                "api_key": key,
                "query": f"{name} fintech funding expansion 2024 2025 LATAM",
                "search_depth": "basic",
                "max_results": 3,
                "include_answer": True
            },
            timeout=aiohttp.ClientTimeout(total=20)
        ) as resp:
            if resp.status == 200:
                d = await resp.json()
                results = d.get("results", [])
                snippets = " | ".join([r.get("content","")[:200] for r in results[:3]])
                return snippets
    except Exception as e:
        print(f"      Tavily error: {e}")
    return ""

async def scrape_website(url: str, session: aiohttp.ClientSession) -> str:
    if not url or not FIRECRAWL_KEY or "google.com" in url: return ""
    try:
        async with session.post(
            "https://api.firecrawl.dev/v1/scrape",
            headers={"Authorization": f"Bearer {FIRECRAWL_KEY}", "Content-Type": "application/json"},
            json={"url": url, "formats": ["markdown"], "onlyMainContent": True},
            timeout=aiohttp.ClientTimeout(total=40)
        ) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get("data", {}).get("markdown", "")
    except Exception as e:
        print(f"      Firecrawl error: {e}")
    return ""

# ── Prompt McKinsey V12 ───────────────────────────────────────
def build_prompt(name: str, website: str, pais: str, context: str) -> str:
    reg = REGULATORS.get(pais.lower().strip(), "Regulador local")
    return f"""Rol: Analista Director McKinsey & Company, especialidad Fintech LATAM.
Empresa: {name} | Website: {website} | País HQ: {pais}
Reguladores: {reg}
Contexto scrapeado: {str(context)[:8000]}

REGLAS CRÍTICAS:
- strategic_hook: pregunta provocativa que termina en "?" — buyer POV, dolor específico
- PROHIBIDO: "democratizar", "[INFERIDO:]", porcentajes inventados, hooks sin "?"
- tier: "Tier 1" (>$10M funding), "Tier 2" ($1-10M), "Tier 3" (early/sin datos)
- competidores: nombres reales de empresas (Truora, Kueski, Clip, etc.), nunca genéricos
- embedding_text: prosa analítica 450-500 palabras en español, sin bullets

JSON OUTPUT (todos los campos obligatorios):
{{
  "nombre": "{name}", "website": "{website}", "pais_hq": "",
  "mercados_latam": [], "ano_fundacion": 0, "etapa_funding": "",
  "total_raised_usd": 0, "empleados_aprox": "Desconocido",
  "vertical": "", "modelo_negocio": "",
  "plataforma": {{"descripcion_core": "", "arquitectura": "", "capacidades_principales": [], "integraciones_nativas": []}},
  "productos_destacados": {{"producto_1": {{"nombre": "", "descripcion": "", "diferenciador": ""}}}},
  "modulos": [], "casos_de_uso": {{"caso_1": "", "caso_2": ""}},
  "industrias_objetivo": [], "core": "", "uvp": "",
  "strategic_hook": "¿Pregunta que termina en signo de interrogación?",
  "pain_1_conversion": "", "pain_2_compliance": "", "pain_3_fraude": "",
  "competidor_1": "", "competidor_2": "", "competidor_3": "",
  "killer_argument": "", "cliente_ideal": "", "clientes_actuales": "",
  "ticket_promedio_usd": "Desconocido", "signal_context": "",
  "strategic_notes": "", "tier": "", "tier_razon": "",
  "framework_venta": "CHALLENGER|MEDDIC|SPIN|INBOUND",
  "embedding_text": "Prosa 450-500 palabras."
}}"""

# ── Prioridad ─────────────────────────────────────────────────
def priority(pais: str) -> int:
    p = str(pais).lower()
    if any(x in p for x in ["mexico","méxico"]): return 1
    if "colombia" in p: return 2
    if any(x in p for x in ["brasil","brazil"]): return 3
    if any(x in p for x in ["argentina","chile","peru","perú","uruguay"]): return 4
    return 5

# ── Main ──────────────────────────────────────────────────────
async def main():
    print("=" * 55)
    print("  NERV ENRICHER — Output CSV (sin Supabase)")
    print(f"  Modelo : {GEMINI_MODEL} | Delay: {DELAY_SECONDS}s")
    print(f"  Keys   : {len(GEMINI_KEYS)} Gemini | Firecrawl: {'SI' if FIRECRAWL_KEY else 'NO'}")
    print("=" * 55)

    df = pd.read_csv(CSV_SOURCE, encoding="utf-8-sig", dtype={"website": str})
    df["website"] = df["website"].fillna("").astype(str)
    df = df[df["website"].str.strip() != ""].copy()
    df["_priority"] = df["pais"].apply(priority)
    df = df.sort_values("_priority")

    # Retomar desde donde quedó (si hay output previo)
    done = set()
    if os.path.exists(OUTPUT_CSV):
        try:
            prev = pd.read_csv(OUTPUT_CSV, encoding="utf-8-sig")
            done = set(prev["website"].dropna().str.strip())
            print(f"  Retomando: {len(done)} ya procesadas")
        except: pass

    SKIP_PATTERNS = ["adicionalmente","no, pero","sí, pero","si, pero","planeamos","encuesta",
                     "actualmente","próximamente","próximos","en proceso","en desarrollo"]
    def is_valid_name(n: str) -> bool:
        n = str(n).strip()
        if len(n) > 60: return False
        if n.lower().startswith(tuple(SKIP_PATTERNS)): return False
        if n.count(",") > 1: return False
        return True

    leads = [r for r in df.to_dict("records")
             if str(r.get("website","")).strip() not in done
             and is_valid_name(r.get("nombre",""))]
    print(f"  Pendientes: {len(leads)}")
    print(f"  ETA: ~{len(leads)*DELAY_SECONDS/3600:.1f} horas\n")

    # CSV output — append mode
    fieldnames = [
        "nombre","website","pais_hq","mercados_latam","ano_fundacion","etapa_funding",
        "total_raised_usd","empleados_aprox","vertical","modelo_negocio",
        "plataforma","productos_destacados","modulos","casos_de_uso","industrias_objetivo",
        "core","uvp","strategic_hook","pain_1_conversion","pain_2_compliance","pain_3_fraude",
        "competidor_1","competidor_2","competidor_3","killer_argument","cliente_ideal",
        "clientes_actuales","ticket_promedio_usd","signal_context","strategic_notes",
        "tier","tier_razon","framework_venta","embedding_text","embedding_vector",
        "embedding_model","embedding_at"
    ]

    write_header = not os.path.exists(OUTPUT_CSV) or len(done) == 0
    outfile = open(OUTPUT_CSV, "a", newline="", encoding="utf-8-sig")
    writer = csv.DictWriter(outfile, fieldnames=fieldnames, extrasaction="ignore")
    if write_header: writer.writeheader()

    count = 0
    async with aiohttp.ClientSession() as session:
        for row in leads:
            name    = str(row.get("nombre","")).strip()
            website = str(row.get("website","")).strip()
            pais    = str(row.get("pais","Desconocido")).strip()

            print(f"[{count+1+len(done)}] {name} ({pais})")

            # 1. Scrape
            content = await scrape_website(website, session)
            tavily_ctx = ""
            if len(content) < 200:
                tavily_ctx = await tavily_signals(name, session)
                if tavily_ctx:
                    print(f"      Tavily signals OK ({len(tavily_ctx)} chars)")
            if len(content) < 100:
                content = f"Empresa: {name}. Vertical: {row.get('vertical','Fintech')}. Pais: {pais}."
                if tavily_ctx:
                    content += f" Señales de mercado: {tavily_ctx}"
                print(f"      Sin contenido web — contexto minimo")
            else:
                print(f"      Scrape OK ({len(content):,} chars)")

            # 2. Gemini
            prompt   = build_prompt(name, website, pais, content)
            raw_json = await call_gemini(prompt)
            if not raw_json:
                await asyncio.sleep(DELAY_SECONDS * 2)
                continue

            # 3. Parse
            try:
                match = re.search(r'(\{.*\})', raw_json, re.DOTALL)
                if not match: continue
                data = json.loads(match.group(1))
            except:
                print(f"      JSON parse error")
                continue

            # 4. Validaciones
            if tavily_ctx and not data.get("signal_context"):
                data["signal_context"] = tavily_ctx[:500]
            hook = data.get("strategic_hook","")
            if not hook.endswith("?"): data["strategic_hook"] = hook.rstrip(".") + "?"
            if data.get("tier") not in ["Tier 1","Tier 2","Tier 3"]:
                data["tier"] = "Tier 3"; data["tier_razon"] = "Sin datos de funding verificables"

            # 5. Embedding
            emb_text = data.get("embedding_text","")
            vector   = await get_embedding(emb_text) if emb_text else None
            if vector:
                data["embedding_vector"] = json.dumps(vector)
                data["embedding_model"]  = "text-embedding-004"
                data["embedding_at"]     = datetime.utcnow().isoformat()
                print(f"      Embedding OK")

            # 6. Serializar listas/dicts para CSV
            for k, v in data.items():
                if isinstance(v, (dict, list)): data[k] = json.dumps(v, ensure_ascii=False)

            writer.writerow(data)
            outfile.flush()
            count += 1
            print(f"      Guardado en CSV — Total: {count + len(done)}")

            await asyncio.sleep(DELAY_SECONDS)

    outfile.close()
    print(f"\n{'='*55}")
    print(f"  COMPLETADO: {count} nuevas empresas enriquecidas")
    print(f"  Output: {OUTPUT_CSV}")
    print(f"{'='*55}")

if __name__ == "__main__":
    asyncio.run(main())
