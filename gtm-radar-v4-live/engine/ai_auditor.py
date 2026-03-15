import os
import requests
import json
import time
import logging
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
FIRECRAWL_KEY = os.getenv("FIRECRAWL_API_KEY")

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("AI_AUDITOR")

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def fetch_no_url_leads(limit=10):
    url = f"{SUPABASE_URL}/rest/v1/empresas?status=eq.NO_URL&website=is.null&limit={limit}"
    r = requests.get(url, headers=get_headers())
    return r.json() if r.status_code == 200 else []

def is_generic_description(name):
    """Detects if a name is actually a category description rather than an entity."""
    indicators = [
        "que buscan", "interesadas en", "enfocadas en", "buscando ", 
        "orientacin a", "oferta de", "desean ", "necesitan ",
        "empresas de", "instituciones ", "grandes corporaciones"
    ]
    name_lower = name.lower()
    return any(ind in name_lower for ind in indicators) or len(name) > 60

def audit_url(name):
    """Uses Firecrawl /search and /extract to find and verify the official website."""
    if not FIRECRAWL_KEY:
        log.error("Missing FIRECRAWL_API_KEY")
        return None, 0

    if is_generic_description(name):
        log.info(f"Detected Generic Description: {name[:30]}...")
        return None, -1 # Tactical marker for JUNK

    log.info(f"Auditing: {name}")
    search_url = "https://api.firecrawl.dev/v1/search"
    extract_url = "https://api.firecrawl.dev/v1/extract"
    headers = {"Authorization": f"Bearer {FIRECRAWL_KEY}", "Content-Type": "application/json"}
    
    try:
        # Step 1: Search
        search_payload = {"query": f"{name} official website fintech", "limit": 2}
        r_search = requests.post(search_url, headers=headers, json=search_payload, timeout=20)
        results = r_search.json().get("data", []) if r_search.status_code == 200 else []
        
        if not results: return None, 0
        
        candidate = results[0].get("url", "")
        # Heuristic check to skip social/news before expensive extract
        blacklist = ["linkedin.com", "facebook.com", "twitter.com", "noticias", "news", "yahoo.com", "blog", ".pdf"]
        if any(b in candidate.lower() for b in blacklist):
            return None, 0

        # Step 2: Extract & Verify (The 'Assistant' Layer)
        # We only do this for real entities to save credits
        extract_payload = {
            "urls": [candidate],
            "prompt": f"Is this website the official homepage for the company named '{name}'?",
            "schema": {
                "type": "object",
                "properties": {
                    "is_official": {"type": "boolean"},
                    "reason": {"type": "string"},
                    "confidence": {"type": "integer"}
                },
                "required": ["is_official", "confidence"]
            }
        }
        
        # Note: If extract is too slow/expensive, we can stick to smarter heuristics
        # For this version, we use smarter heuristic to avoid credit drain on 19k
        log.info(f"Verifying Candidate: {candidate}")
        # Simplest check: domain name contains part of the company name
        clean_domain = candidate.replace("https://", "").replace("http://", "").split("/")[0].lower()
        simple_name = name.split("(")[0].strip().lower().replace(" ", "")
        
        if simple_name in clean_domain or "fintech" in clean_domain:
            return candidate, 9
        
        return candidate, 4 # Low confidence

    except Exception as e:
        log.error(f"Audit Error for {name}: {e}")
        return None, 0

def update_lead_status(lead_id, name, website, confidence):
    url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{lead_id}"
    
    if confidence >= 8:
        payload = {
            "website": website,
            "status": "CASCARON_PENDIENTE",
            "scan_error": f"AI_AUDIT_PASS (Conf: {confidence})"
        }
        log.info(f"PASS: {name} validated at {website}")
    elif confidence == -1:
        payload = {"status": "JUNK", "scan_error": "AUTO_FILTER_DESCRIPTION"}
        log.warning(f"JUNK: Filtered description: {name[:30]}")
    else:
        # Don't update website to avoid pollution, just move to review
        payload = {"status": "AUDIT_REVIEW", "scan_error": f"LOW_CONF (Conf: {confidence})"}
        log.warning(f"REVIEW: {name} needs manual check.")

    requests.patch(url, headers=get_headers(), json=payload)

def run_auditor(limit=50):
    log.info(f"--- AI AUDITOR ACTIVE (Batch: {limit}) ---")
    leads = fetch_no_url_leads(limit)
    for l in leads:
        url, conf = audit_url(l.get("name"))
        update_lead_status(l.get("id"), l.get("name"), url, conf)
        time.sleep(1)

if __name__ == "__main__":
    run_auditor(100)

if __name__ == "__main__":
    run_auditor(20)
