import os
import requests
import json
import time
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

# ── CONFIGURATION ──────────────────────────────────────────────────────────
load_dotenv(r"c:\Users\antonio\.gemini\antigravity\scratch\nexus-poc\engine\.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SERPER_KEY   = os.getenv("SERPER_API_KEY_VM")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("FOOTPRINT_HUNTER")

# ── TARGETS ────────────────────────────────────────────────────────────────
# Antonio's specific conquest seeds
CONQUEST_TARGETS = [
    {"name": "EBANX", "footprints": ['site:linkedin.com "at EBANX"', '"powered by EBANX"', '"cliente EBANX"']},
    {"name": "Sumsub", "footprints": ['"powered by Sumsub"', '"verified by Sumsub"', 'site:crunchbase.com "using Sumsub"']},
    {"name": "Backbase", "footprints": ['"powered by Backbase"', '"integrated with Backbase"', '"Engagement Banking Platform"']},
    {"name": "Topaz", "footprints": ['"powered by Topaz"', '"Core Banking Topaz"', '"Core Bancario Topaz"']}
]

# ── DATABASE INTERFACE ─────────────────────────────────────────────────────
def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def ingest_conquest_lead(name, website, competitor, signal):
    """Ingests a new lead found via competitor footprints."""
    log.info(f"CONQUEST: NEW: {name} ({website}) uses {competitor}")
    
    payload = {
        "name": name,
        "website": website,
        "status": "PENDIENTE",
        "description": json.dumps({
            "conquest_target": competitor,
            "signal": signal,
            "origin": "FOOTPRINT_HUNTER",
            "date_found": time.strftime("%Y-%m-%d")
        }),
        "reverse_icp_links": json.dumps({"source": competitor, "type": "conquest"}),
        "last_scan": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    
    # Check if exists (upsert)
    r = requests.post(f"{SUPABASE_URL}/rest/v1/empresas", headers=get_headers(), json=payload)
    if r.status_code in [201, 204, 409]:
        return True
    return False

# ── HUNTING LOGIC ──────────────────────────────────────────────────────────
def hunt_footprint(target_name, query):
    if not SERPER_KEY: return []
    
    url = "https://google.serper.dev/search"
    headers = {'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json'}
    payload = json.dumps({"q": query, "num": 20})
    
    discovered = []
    try:
        r = requests.post(url, headers=headers, data=payload, timeout=15)
        if r.status_code == 200:
            results = r.json().get("organic", [])
            for res in results:
                title = res.get("title", "")
                link = res.get("link", "")
                snippet = res.get("snippet", "")
                
                # Extract potential company names from domain or title
                # This is a heuristic: we'll clean it up later if needed
                domain_parts = link.replace("http://","").replace("https://","").split("/")[0].split(".")
                potential_name = domain_parts[0] if len(domain_parts) > 1 else title
                
                discovered.append({
                    "name": potential_name.capitalize(),
                    "website": f"https://{link.split('/')[2]}" if "/" in link else link,
                    "signal": f"MATCH: {query} | {snippet[:50]}..."
                })
        return discovered
    except Exception as e:
        log.error(f"ERR: Serper Hunt Error for {target_name}: {e}")
        return []

def run_conquest():
    log.info("RUN: Launching Footprint Hunter Attack...")
    
    for target in CONQUEST_TARGETS:
        for query in target["footprints"]:
            log.info(f"HUNT: Tracking {target['name']} via: {query}")
            findings = hunt_footprint(target["name"], query)
            
            for find in findings:
                # Basic domain cleaning (prevent siphoning competitors themselves)
                if target["name"].lower() in find["website"].lower(): continue
                
                ingest_conquest_lead(find["name"], find["website"], target["name"], find["signal"])
                time.sleep(0.5) # Avoid DB spam

if __name__ == "__main__":
    run_conquest()
