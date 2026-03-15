import os
import sys
import requests
import json
import logging
from datetime import datetime
from dotenv import load_dotenv

from reasoning_engine import analyze_strategic_fit

# Load credentials
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [SURGICAL_RADAR] %(message)s")
log = logging.getLogger("SURGICAL")

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def deep_research(url):
    """Combines Tavily and basic scraping to get the technical truth."""
    if not TAVILY_API_KEY:
        log.warning("TAVILY_API_KEY missing.")
        return ""
    
    query = f"Provide a detailed technical benchmark and expansion analysis for {url} focus on payment infrastructure, AWS regions, and Latin American market strategy."
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "advanced",
        "include_answer": True,
        "max_results": 3
    }
    
    try:
        r = requests.post("https://api.tavily.com/search", json=payload, timeout=30)
        if r.status_code == 200:
            data = r.json()
            answer = data.get("answer", "")
            results = data.get("results", [])
            content = answer + "\n" + "\n".join([res.get("content", "") for res in results])
            return content if content.strip() else "No deep intel found."
    except Exception as e:
        log.error(f"Research Exception: {e}")
    return ""

def generate_battle_card(target_url, competitor_url, target_intel, comp_intel):
    """
    The MAGIC function. Produces the surgical dossier as a structured object.
    Now with AUTONOMOUS STRATEGIC REASONING.
    """
    target_name = target_url.replace('https://', '').replace('www.', '').split('.')[0].upper()
    comp_name = competitor_url.replace('https://', '').replace('www.', '').split('.')[0].upper() if competitor_url else "MERCADO ABIERTO"

    # DETONAR EL CEREBRO DE NERV
    analysis = analyze_strategic_fit(target_intel, "México")

    dossier = {
        "title": f"BATTLE CARD DECK: {target_name}",
        "target": target_name,
        "competitor": comp_name,
        "date": datetime.now().strftime('%d %b, %Y'),
        "cards": analysis["cards"],
        "confidence": analysis["confidence"],
        "tech_truth": target_intel[:500]
    }
    return dossier

def run_surgical_strike(target_url, comp_url=None):
    log.info(f"🚀 DETONATING SURGICAL RADAR: {target_url} vs {comp_url}")
    
    # 1. Gather Intelligence
    target_intel = deep_research(target_url)
    comp_intel = deep_research(comp_url) if comp_url else "N/A"
    
    # 2. Generate the Magic Doc
    dossier_obj = generate_battle_card(target_url, comp_url, target_intel, comp_intel)
    
    # 3. Save to Supabase
    payload = {
        "name": dossier_obj["target"],
        "website": target_url,
        "status": "ENRIQUECIDO",
        "description": json.dumps(dossier_obj),
        "source": "SURGICAL_STRIKE",
        "last_scan": datetime.utcnow().isoformat()
    }
    
    # Check if exists
    check_url = f"{SUPABASE_URL}/rest/v1/empresas?website=eq.{target_url}&select=id"
    r = requests.get(check_url, headers=get_headers())
    if r.status_code == 200 and r.json():
        eid = r.json()[0]["id"]
        requests.patch(f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{eid}", headers=get_headers(), json=payload)
    else:
        requests.post(f"{SUPABASE_URL}/rest/v1/empresas", headers=get_headers(), json=payload)

    log.info("🎯 MISSION COMPLETE: Structured Dossier saved.")
    print(json.dumps(dossier_obj, indent=2))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python surgical_dossier.py <target_url> [comp_url]")
    else:
        u1 = sys.argv[1]
        u2 = sys.argv[2] if len(sys.argv) > 2 else None
        run_surgical_strike(u1, u2)
