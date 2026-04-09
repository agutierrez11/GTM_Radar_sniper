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
log = logging.getLogger("BLACK_OPS_REDDIT")

# ── DATABASE INTERFACE ─────────────────────────────────────────────────────
def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def fetch_top_leads(limit=20):
    """Fetches real companies (with websites) to perform Black Ops social mining on."""
    print("FETCH: Fetching target leads with websites for Black Ops...")
    # Priority on leads that have been enriched or activated with a website
    url = f"{SUPABASE_URL}/rest/v1/empresas?website=not.is.null&status=eq.PENDIENTE&limit={limit}"
    response = requests.get(url, headers=get_headers())
    if response.status_code == 200:
        return response.json()
    return []

# ── BLACK OPS LOGIC ────────────────────────────────────────────────────────
def search_social_intel(company_name):
    """Searches Reddit and Forums for intent signals via Serper."""
    if not SERPER_KEY: return []

    url = "https://google.serper.dev/search"
    headers = {'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json'}
    # Query for complaints, alternatives, or reviews
    queries = [
        f'site:reddit.com "{company_name}" alternative',
        f'site:reddit.com "{company_name}" problem',
        f'site:reddit.com "{company_name}" review'
    ]
    
    all_social_intel = []
    
    for q in queries[:2]: # Limit to 2 queries per company to save credits
        payload = json.dumps({"q": q, "tbs": "qdr:m"}) # Last month
        try:
            r = requests.post(url, headers=headers, data=payload, timeout=15)
            if r.status_code == 200:
                results = r.json().get("organic", [])
                for item in results[:3]:
                    all_social_intel.append({
                        "platform": "Reddit/Forum",
                        "title": item.get("title"),
                        "snippet": item.get("snippet"),
                        "link": item.get("link")
                    })
        except Exception as e:
            log.error(f"ERR: Serper Social Error [{company_name}]: {e}")
            
    return all_social_intel

def process_black_ops(lead):
    lid = lead.get("id")
    name = lead.get("name")
    
    log.info(f"HUNT: BLACK OPS: Hunting social signals for {name}...")
    social_data = search_social_intel(name)
    
    if social_data:
        # Check for High Intent Keywords
        intent_score = 0
        keywords = ["bad", "problem", "expensive", "hate", "issue", "support", "alternative", "switching"]
        
        findings = []
        for s in social_data:
            text = (s["title"] + " " + s["snippet"]).lower()
            if any(k in text for k in keywords):
                intent_score += 1
                findings.append(s)

        if intent_score > 0:
            log.info(f"HIT: HIGH INTENT SIGNAL: {name} found in social discussions ({intent_score} matches).")
            # Update the description/intel with social findings
            social_payload = {
                "platform": "Reddit",
                "signals": findings,
                "intent_detected": True,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Append to description or a dedicated social column if it exists
            # For now, we'll store it structured in a way the dashboard can render
            payload = {
                "products_services": f"INTENT_SIGNAL: {json.dumps(social_payload)}"
            }
            requests.patch(f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{lid}", headers=get_headers(), json=payload)
            return True
    
    return False

# ── ORCHESTRATOR ──────────────────────────────────────────────────────────
def run_black_ops():
    leads = fetch_top_leads(20)
    if not leads:
        print("OK: No target leads for social mining.")
        return

    print(f"RUN: Deploying Black Ops for {len(leads)} companies...")
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(process_black_ops, l): l for l in leads}
        for future in as_completed(futures):
            future.result()

if __name__ == "__main__":
    run_black_ops()
