import os
import requests
import json
import logging
from dotenv import load_dotenv

# Load credentials
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [LIKELY_ENGINE] %(message)s")
log = logging.getLogger("LIKELY")

# ─────────────────────────────────────────────
# STRATEGIC DNA: SUMSUB COMMANDER LOGIC
# ─────────────────────────────────────────────

STRATEGIC_INTEL = {
    "COMPETITORS": {
        "Incode": "Debilidad: No Code Platform. Victoria: Sumsub permite cambios en 5 min.",
        "Truora": "Debilidad: Solo KYC/WhatsApp. Victoria: Sumsub es Full-Cycle Monitor.",
        "Velafi": "Debilidad: Agregadores. Victoria: Sumsub es Tecnología Directa.",
        "Auco": "Debilidad: Regional (Cono Sur). Victoria: Global Reach Sumsub.",
        "Shufti Pro": "Debilidad: Soporte rígido. Victoria: Agilidad No-Code."
    },
    "REGIONAL_PAIN": {
        "México": "Reto: 45% abandono. Solución: Verificación sin Documentos (INE/CURP).",
        "Brasil": "Reto: +800% Deepfakes. Solución: Biometría Liveness 3D.",
        "Colombia": "Reto: Onboarding lento. Solución: KYB Automation."
    },
    "SEEDS": ["Nu México", "Stori", "Nubank", "Koin", "Clip", "Konfio", "Ualá", "Kueski"]
}

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def get_company_dna(company_id):
    """Fetches a company's technical DNA from its description/tags in Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{company_id}&select=name,website,description,radar_tags"
    r = requests.get(url, headers=get_headers())
    if r.status_code == 200:
        data = r.json()
        return data[0] if data else None
    return None

def find_lookalikes_via_tavily(company_name, tech_stack):
    """Uses Tavily to query for companies with similar technical DNA."""
    if not TAVILY_API_KEY:
        log.warning("SKIP: TAVILY_API_KEY missing. Cannot perform DNA Lookalike search.")
        return []

    # Construct a high-intent query
    query = f"Main competitors or lookalike companies of {company_name} in LatAm using {tech_stack} payment rails"
    
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "advanced",
        "max_results": 5
    }
    
    try:
        r = requests.post(url, json=payload, timeout=30)
        if r.status_code == 200:
            results = r.json().get("results", [])
            lookalikes = []
            for res in results:
                lookalikes.append({
                    "name": res.get("title", "Unknown"),
                    "url": res.get("url", ""),
                    "reason": res.get("content", "")[:200]
                })
            return lookalikes
        log.error(f"ERR: Tavily failed {r.status_code}")
    except Exception as e:
        log.error(f"EXC: Tavily exception: {e}")
    return []

def extract_battle_signals(name, content, country="all"):
    """
    ANALYZER: Extracts specific pain points and competitive triggers (Sumsub DNA).
    Returns: list of signals.
    """
    signals = []
    content_l = content.lower()
    
    # 1. Competitive Flanking
    for comp, battle_card in STRATEGIC_INTEL["COMPETITORS"].items():
        if comp.lower() in content_l:
            signals.append(f"FLANKING_DETECTED: {comp} user. Action: {battle_card}")

    # 2. Regional Schwerpunkt
    country_norm = "México" if "mexico" in country.lower() else "Brasil" if "brasil" in country.lower() else "Colombia" if "colombia" in country.lower() else None
    if country_norm and country_norm in STRATEGIC_INTEL["REGIONAL_PAIN"]:
        signals.append(f"REGIONAL_PAIN: {STRATEGIC_INTEL['REGIONAL_PAIN'][country_norm]}")

    # 3. Predictable Revenue (Expansion)
    growth_triggers = ["hiring", "expansion", "series", "funding", "vacantes"]
    if any(g in content_l for g in growth_triggers):
        signals.append("SIGNAL: High Expansion (Predictable Revenue Moment).")

    return signals

def inject_lookalikes(parent_id, suspects):
    """Adds discovered suspects to Supabase as CASCARON_PENDIENTE."""
    ingest_url = f"{SUPABASE_URL}/rest/v1/empresas"
    headers = get_headers()
    headers.update({"Prefer": "return=minimal"})
    
    for s in suspects:
        if not s["url"]: continue
        
        payload = {
            "name": s["name"],
            "website": s["url"],
            "status": "CASCARON_PENDIENTE",
            "source": f"LIKELY_LOOKALIKES_{parent_id}",
            "notes": f"Detected via Tavily Lookalike search for ID {parent_id}. Context: {s['reason']}"
        }
        
        requests.post(ingest_url, headers=headers, json=payload)
    
    log.info(f"OK: Injected {len(suspects)} suspects into the pipeline.")

def dna_cycle(company_id):
    """Full Cycle: Extract DNA -> Find Lookalikes -> Inject."""
    dna = get_company_dna(company_id)
    if not dna:
        log.error(f"ERR: Company {company_id} not found.")
        return

    log.info(f"CYCEL Start: Analyzing Lookalikes for {dna['name']}...")
    
    # Simple DNA extraction from tags or description
    tech_markers = dna.get("radar_tags", [])
    if not tech_markers and dna.get("description"):
        # Basic heuristic for the demo
        markers = ["Nium", "Stripe", "Pix", "KYC", "Cross-border", "iGaming"]
        tech_markers = [m for m in markers if m.lower() in dna["description"].lower()]

    tech_stack_str = ", ".join(tech_markers) if tech_markers else "fintech payments"
    
    suspects = find_lookalikes_via_tavily(dna["name"], tech_stack_str)
    if suspects:
        inject_lookalikes(company_id, suspects)
    else:
        log.info("No lookalikes found in this cycle.")

if __name__ == "__main__":
    # Test with a known ID if provided, otherwise pick a random Enriched one
    import sys
    target_id = sys.argv[1] if len(sys.argv) > 1 else None
    
    if not target_id:
        # Fetch one Enriched lead to demonstrate
        url = f"{SUPABASE_URL}/rest/v1/empresas?status=eq.ENRIQUECIDO&limit=1"
        r = requests.get(url, headers=get_headers())
        if r.status_code == 200 and r.json():
            target_id = r.json()[0]["id"]
    
    if target_id:
        dna_cycle(target_id)
    else:
        log.info("No targets found to start DNA cycle.")
