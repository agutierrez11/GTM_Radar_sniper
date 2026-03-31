"""
NERV URL Lookup — Fase 2
Busca websites para 836 empresas MX+CO sin URL usando Tavily
Output: NERV_PHASE2_LOOKUP_WITH_URLS.csv (listo para enricher)
"""
import os
import asyncio
import aiohttp
import pandas as pd
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env.local"))

TAVILY_KEYS  = [k for k in [os.getenv(f"TAVILY_API_KEY{s}") for s in ["", "_2"]] if k]
INPUT_CSV    = r"C:\Users\Antonio\Desktop\NERV_PHASE2_LOOKUP.csv"
OUTPUT_CSV   = r"C:\Users\Antonio\Desktop\NERV_PHASE2_LOOKUP_WITH_URLS.csv"
DELAY        = 1

_trr = 0

async def find_url(name: str, pais: str, session: aiohttp.ClientSession) -> str:
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
                "query": f"{name} fintech {pais} sitio web oficial",
                "search_depth": "basic",
                "max_results": 3,
                "include_answer": False
            },
            timeout=aiohttp.ClientTimeout(total=15)
        ) as resp:
            if resp.status == 200:
                d = await resp.json()
                results = d.get("results", [])
                for r in results:
                    url = r.get("url", "")
                    # Filtrar redes sociales y directorios genéricos
                    skip = ["linkedin","facebook","twitter","crunchbase","wikipedia",
                            "bloomberg","instagram","youtube","tiktok","glassdoor"]
                    if url and not any(s in url.lower() for s in skip):
                        return url
    except Exception as e:
        print(f"      Error: {e}")
    return ""

async def main():
    print("=" * 55)
    print("  NERV URL LOOKUP — MX+CO sin website")
    print(f"  Tavily keys: {len(TAVILY_KEYS)}")
    print("=" * 55)

    df = pd.read_csv(INPUT_CSV, encoding="utf-8-sig")
    print(f"  Total a procesar: {len(df):,}")

    # Retomar desde donde quedó
    done = {}
    if os.path.exists(OUTPUT_CSV):
        prev = pd.read_csv(OUTPUT_CSV, encoding="utf-8-sig")
        done = dict(zip(
            prev["nombre"].str.strip().str.lower(),
            prev["website_found"].fillna("")
        ))
        print(f"  Retomando: {len(done):,} ya procesadas")

    pending = df[~df["nombre"].str.strip().str.lower().isin(done)].copy()
    print(f"  Pendientes: {len(pending):,}")
    print(f"  ETA: ~{len(pending) * DELAY / 60:.0f} minutos\n")

    results = []
    found = 0

    async with aiohttp.ClientSession() as session:
        for i, (_, row) in enumerate(pending.iterrows()):
            name = str(row.get("nombre", "")).strip()
            pais = str(row.get("pais", "")).strip()

            url = await find_url(name, pais, session)
            status = "✅" if url else "❌"
            if url: found += 1

            print(f"[{i+1+len(done)}] {name} ({pais}) {status}")
            if url: print(f"      → {url}")

            results.append({**row.to_dict(), "website_found": url})
            await asyncio.sleep(DELAY)

    # Combinar con los ya procesados y guardar
    results_df = pd.DataFrame(results)
    if done:
        prev_df = pd.read_csv(OUTPUT_CSV, encoding="utf-8-sig")
        results_df = pd.concat([prev_df, results_df], ignore_index=True)

    results_df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")

    con_url = results_df[results_df["website_found"].notna() & (results_df["website_found"].str.strip() != "")]
    print(f"\n{'='*55}")
    print(f"  URLs encontradas: {len(con_url):,} / {len(results_df):,}")
    print(f"  Tasa de éxito:    {len(con_url)/len(results_df)*100:.0f}%")
    print(f"  Output: {OUTPUT_CSV}")
    print(f"{'='*55}")

if __name__ == "__main__":
    asyncio.run(main())
