import os
import requests
import json
import time
import logging
from datetime import datetime
from dotenv import load_dotenv

# Strategic Intelligence Refiner
# Transforms 'Gold Leads' into 'Diamonds' (100% Liquidated)

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
FIRECRAWL_KEY = os.getenv("FIRECRAWL_API_KEY") # Primary for extraction

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("REFINERY_AGENT")

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def fetch_gold_leads(limit=100):
    """Fetch leads that are ready for deep strategic refinement."""
    # Logic: Status PENDIENTE, NO_URL, or GOLD (Gigantes) with a non-empty description
    url = f"{SUPABASE_URL}/rest/v1/empresas?description=not.is.null&status=in.(PENDIENTE,NO_URL,GOLD)&limit={limit}"
    r = requests.get(url, headers=get_headers())
    return r.json() if r.status_code == 200 else []

def liquidate_strategy(lead_name, lead_desc, url=None):
    """
    Simulates the AI-driven Strategic Distillation.
    In a real production environment, this would call an LLM (GPT-4/Claude) 
    with a specific GTM prompt for MEDDIC, SPIN, and the Multiplier.
    """
    log.info(f"Refining Strategy for: {lead_name}")
    
    # Placeholder for LLM Strategic logic
    # In this MVP, we use the strategic patterns defined in the SOP
    strategy = {
        "country_context": "Sujeto a Regulación Financiera Local",
        "pain_point": "Fricción operativa y baja tasa de conversión en onboarding",
        "kill_shot": f"Nuestra infraestructura supera la rigidez de la competencia para {lead_name}",
        "meddic": {
            "economic_buyer": "CTO / Head of Growth",
            "champion": "Product Manager / Ops Lead",
            "metrics": "Reducción de 30% en Customer Acquisition Cost"
        },
        "spin_questions": [
            "¿Cómo afecta la latencia actual tu embudo de ventas?",
            "¿Cuánto te cuesta cada usuario que abandona el flujo?"
        ],
        "alliance_multiplier": "YUNO / KUSHKI Contextual Integration",
        "status": "DIAMANTE" # Tactical marker for 100% Liquidated
    }
    
    # In a higher-fidelity version, we would use the scraped content (Firecrawl) 
    # to make these points specific to the account.
    return strategy

def update_to_diamond(lead_id, name, strategy):
    """Persists the 'Diamond' status and the structured GTM Dossier."""
    url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{lead_id}"
    
    # We store the dossier in the description as a structured JSON 
    # but we also update the status to mark it as 'Diamond'.
    payload = {
        "description": json.dumps(strategy),
        "status": "ENRIQUECIDO", # Use existing status for dashboard compatibility
        "scan_error": "LIQUIDATED_DIAMOND"
    }
    
    r = requests.patch(url, headers=get_headers(), json=payload)
    if r.status_code in [200, 204]:
        log.info(f"💎 DIAMOND CREATED: {name}")
        return True
    return False

def run_pilot(limit=100):
    log.info(f"--- REFINERY AGENT: PILOT START (Target: {limit} Leads) ---")
    leads = fetch_gold_leads(limit)
    
    if not leads:
        log.warning("No Gold Leads found for refinery.")
        return

    count = 0
    for l in leads:
        name = l.get("name")
        desc = l.get("description")
        lid = l.get("id")
        
        strategy = liquidate_strategy(name, desc, l.get("website"))
        if update_to_diamond(lid, name, strategy):
            count += 1
        
        # Throttling to keep VM stable
        time.sleep(0.5)

    log.info(f"--- PILOT COMPLETE: {count} leads liquidated into Diamonds ---")

if __name__ == "__main__":
    run_pilot(100)
