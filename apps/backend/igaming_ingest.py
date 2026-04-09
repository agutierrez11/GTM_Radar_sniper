import os
import requests
import json
import logging
from dotenv import load_dotenv

# Load credentials
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role for bulk operations

logging.basicConfig(level=logging.INFO, format="%(asctime)s [INGEST] %(message)s")
log = logging.getLogger("INGEST")

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def ingest_batch(leads):
    """Bulk inserts leads as CASCARON_PENDIENTE to trigger the Sniper."""
    url = f"{SUPABASE_URL}/rest/v1/empresas"
    
    formatted_leads = []
    for lead in leads:
        formatted_leads.append({
            "name": lead["name"],
            "website": lead["url"],
            "status": "CASCARON_PENDIENTE",
            "source": "IGAMING_STRESS_TEST"
        })
    
    try:
        r = requests.post(url, headers=get_headers(), json=formatted_leads)
        if r.status_code in [201, 204]:
            log.info(f"OK: Ingested {len(leads)} targets.")
            return True
        log.error(f"ERR: Ingestion failed {r.status_code} - {r.text}")
        return False
    except Exception as e:
        log.error(f"EXC: {e}")
        return False

if __name__ == "__main__":
    # Example targets for the stress test (To be expanded with user's specific list)
    STRESS_TARGETS = [
        {"name": "Bet365", "url": "https://www.bet365.com"},
        {"name": "888casino", "url": "https://www.888casino.com"},
        {"name": "Codere", "url": "https://www.codere.com"},
        {"name": "Betsson", "url": "https://www.betsson.com"},
        {"name": "Caliente", "url": "https://www.caliente.mx"},
        {"name": "Roobet", "url": "https://roobet.com"},
        {"name": "Stake", "url": "https://stake.com"},
        {"name": "Casigo", "url": "https://www.casigo.com"},
        {"name": "Playzee", "url": "https://www.playzee.com"},
        {"name": "Gate777", "url": "https://www.gate777.com"}
    ]
    
    log.info("🚀 Launching iGaming Stress Test Ingestion...")
    if ingest_batch(STRESS_TARGETS):
        print("\n[!] BATCH LOADED. Detonating Radar Cycle...")
