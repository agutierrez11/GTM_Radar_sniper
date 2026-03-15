import os
import requests
import json
from dotenv import load_dotenv

load_dotenv('engine/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

PERSONAS = {
    "payments": ["saas", "payments", "pagos", "b2b", "fintech", "banking", "finance", "credit", "checkout", "gateway", "psp"],
    "proptech": ["real estate", "proptech", "inmobiliaria", "alquiler", "rent", "mortgage", "hipoteca", "broker", "construccion"],
    "insurtech": ["insurance", "seguros", "insurtech", "policy", "claim", "actuary", "reinsurance", "siniestro"],
    "ecommerce": ["ecommerce", "retail", "shop", "marketplace", "cart", "shopify", "woocommerce", "shipping", "logistics"],
    "universal": ["saas", "soft", "tech", "platform", "plataforma", "scale", "hypergrowth", "digital", "api"]
}

def calculate_score(lead, persona="universal"):
    score = 0
    
    # 1. Official Website (Validated)
    if lead.get('website') and lead.get('status') == 'ENRIQUECIDO':
        score += 20
        
    # 2. Premium Data (Timeline/Funding)
    # Check if there is high-fidelity data in specific columns
    if lead.get('funding_stage') or lead.get('infra_potential'):
        score += 20
        
    intel = lead.get('description', '') or ''
    if 'Timeline' in intel or 'Fondeo' in intel or '"source": "Latam Fintech Hub"' in intel:
        score += 20
        
    # 3. Strategic Keyword Match (Persona Based)
    name = (lead.get('name') or "").lower()
    description = (lead.get('description') or "").lower()
    sector = (lead.get('sector') or "").lower()
    content = f"{name} {description} {sector}"
    
    keywords = PERSONAS.get(persona, PERSONAS["universal"])
    matches = [kw for kw in keywords if kw in content]
    score += min(len(matches) * 5, 30) # Max 30 pts for keywords
    
    # 4. Survivorship Signal (Rescue Rescue)
    if lead.get('scan_error') == 'RESCUED_FROM_JUNK':
        score += 10
        
    return score

def run_scorer(limit=100, persona="universal"):
    print(f"--- SNIPER UNIVERSAL SCORER STARTING (Persona: {persona}, Batch: {limit}) ---")
    
    # Fetch leads to score
    fetch_url = f"{SUPABASE_URL}/rest/v1/empresas?limit={limit}&select=id,name,website,status,description,scan_error,sector,funding_stage,infra_potential"
    r = requests.get(fetch_url, headers=headers)
    if r.status_code != 200:
        print(f"Error fetching leads: {r.text}")
        return
        
    leads = r.json()
    scored_leads = []
    
    for l in leads:
        score = calculate_score(l)
        print(f"ID: {l['id']} | Name: {l['name'][:30]:<30} | Score: {score}")
        
        # Persistence: Store score in a JSON block within description for now
        # until a 'score' column is added.
        try:
            current_intel = {}
            if l.get('description') and l['description'].startswith('{'):
                current_intel = json.loads(l['description'])
            else:
                current_intel = {"raw_description": l.get('description')}
                
            current_intel['sniper_score'] = score
            
            patch_url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{l['id']}"
            r_patch = requests.patch(patch_url, headers=headers, json={"description": json.dumps(current_intel)})
            if r_patch.status_code not in [200, 204]:
                print(f"Failed to patch {l['id']}: {r_patch.text}")
        except Exception as e:
            print(f"Error persisting score for {l['id']}: {e}")
        
    print(f"--- SCORING PILOT COMPLETE ---")

if __name__ == "__main__":
    # Launching massive ranking for the universe of leads
    import sys
    limit = 500  # Default batch for this run
    if len(sys.argv) > 1:
        limit = int(sys.argv[1])
    
    run_scorer(limit, persona="universal")
