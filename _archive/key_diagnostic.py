"""
DIAGNOSTIC: API Key Health Check
Tests all Firecrawl, Scrape.do, and ScraperAPI keys for remaining credits.
"""
import os, requests, json
from dotenv import load_dotenv
load_dotenv(dotenv_path=r"C:\Users\antonio\.gemini\antigravity\.env")

TEST_URL = "https://httpbin.org/html"

results = {}

# ─── FIRECRAWL ───────────────────────────────────────────────────────────────
firecrawl_keys = {
    "Firecrawl_01": os.getenv("FIRECRAWL_API_KEY"),
    "Firecrawl_02": os.getenv("FIRECRAWL_API_KEY_2"),
    "Firecrawl_03": os.getenv("FIRECRAWL_API_KEY_3"),
}

print("\n🔥 FIRECRAWL KEY DIAGNOSTIC")
print("─" * 50)
for name, key in firecrawl_keys.items():
    if not key:
        print(f"  [{name}] ❌ KEY NOT LOADED")
        results[name] = "NOT_LOADED"
        continue
    try:
        r = requests.post(
            "https://api.firecrawl.dev/v1/scrape",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"url": TEST_URL, "formats": ["markdown"]},
            timeout=20
        )
        if r.status_code == 200:
            print(f"  [{name}] ✅ ONLINE  (key: {key[:20]}...)")
            results[name] = "ONLINE"
        elif r.status_code == 402:
            print(f"  [{name}] 💀 EXHAUSTED — No credits (key: {key[:20]}...)")
            results[name] = "EXHAUSTED"
        elif r.status_code == 401:
            print(f"  [{name}] 🚫 UNAUTHORIZED — Bad key (key: {key[:20]}...)")
            results[name] = "UNAUTHORIZED"
        else:
            print(f"  [{name}] ⚠️  HTTP {r.status_code} (key: {key[:20]}...)")
            results[name] = f"HTTP_{r.status_code}"
    except Exception as e:
        print(f"  [{name}] ❌ CONNECTION ERROR: {e}")
        results[name] = "ERROR"

# ─── SCRAPE.DO ───────────────────────────────────────────────────────────────
print("\n🌐 SCRAPE.DO KEY DIAGNOSTIC")
print("─" * 50)
for label, key in [("ScrapeDoLocal", os.getenv("SCRAPEDO_API_KEY_LOCAL")),
                   ("ScrapeDoVM",    os.getenv("SCRAPEDO_API_KEY_VM"))]:
    if not key:
        print(f"  [{label}] ❌ KEY NOT LOADED")
        results[label] = "NOT_LOADED"
        continue
    try:
        r = requests.get(f"https://api.scrape.do/?token={key}&url={TEST_URL}", timeout=20)
        if r.status_code == 200 and len(r.text) > 100:
            print(f"  [{label}] ✅ ONLINE  (key: {key[:20]}...)")
            results[label] = "ONLINE"
        elif r.status_code == 403 or "quota" in r.text.lower():
            print(f"  [{label}] 💀 EXHAUSTED (key: {key[:20]}...)")
            results[label] = "EXHAUSTED"
        else:
            print(f"  [{label}] ⚠️  HTTP {r.status_code} len={len(r.text)}")
            results[label] = f"HTTP_{r.status_code}"
    except Exception as e:
        print(f"  [{label}] ❌ ERROR: {e}")
        results[label] = "ERROR"

# ─── SCRAPERAPI ───────────────────────────────────────────────────────────────
print("\n🔑 SCRAPERAPI KEY DIAGNOSTIC")
print("─" * 50)
key = os.getenv("SCRAPERAPI_API_KEY")
if not key:
    print("  [ScraperAPI] ❌ KEY NOT LOADED")
    results["ScraperAPI"] = "NOT_LOADED"
else:
    try:
        r = requests.get(f"http://api.scraperapi.com/?api_key={key}&url={TEST_URL}", timeout=20)
        if r.status_code == 200 and len(r.text) > 100:
            print(f"  [ScraperAPI] ✅ ONLINE  (key: {key[:20]}...)")
            results["ScraperAPI"] = "ONLINE"
        elif r.status_code == 403:
            print(f"  [ScraperAPI] 💀 EXHAUSTED or FORBIDDEN")
            results["ScraperAPI"] = "EXHAUSTED"
        else:
            print(f"  [ScraperAPI] ⚠️  HTTP {r.status_code}")
            results["ScraperAPI"] = f"HTTP_{r.status_code}"
    except Exception as e:
        print(f"  [ScraperAPI] ❌ ERROR: {e}")
        results["ScraperAPI"] = "ERROR"

# ─── SUMMARY ─────────────────────────────────────────────────────────────────
print("\n📊 RESUMEN DIAGNÓSTICO")
print("=" * 50)
online = [k for k,v in results.items() if v == "ONLINE"]
exhausted = [k for k,v in results.items() if v == "EXHAUSTED"]
errors = [k for k,v in results.items() if v not in ("ONLINE","EXHAUSTED")]

print(f"  ✅ ONLINE ({len(online)}):    {', '.join(online) or 'ninguno'}")
print(f"  💀 EXHAUSTED ({len(exhausted)}): {', '.join(exhausted) or 'ninguno'}")
print(f"  ⚠️  ERRORS ({len(errors)}):    {', '.join(errors) or 'ninguno'}")
print()

with open("key_diagnostic_results.json", "w") as f:
    json.dump(results, f, indent=2)
print("  💾 Resultados guardados en key_diagnostic_results.json")
