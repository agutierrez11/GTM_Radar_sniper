import os
import requests
import json
import time
import re
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

# ── CONFIGURATION ──────────────────────────────────────────────────────────
load_dotenv(r"c:\Users\antonio\.gemini\antigravity\scratch\nexus-poc\engine\.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SERPER_KEY   = os.getenv("SERPER_API_KEY_VM")
SCRAPEDO_KEY = os.getenv("SCRAPEDO_API_KEY_VM")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("URL_FINDER_RICP")

# ── DATABASE INTERFACE ─────────────────────────────────────────────────────
def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def fetch_dormant_leads(limit=1000):
    """Fetches leads missing a website URL, prioritized by those in the Vault audit."""
    print("FETCH: Fetching dormant leads from Supabase...")
    # Target leads with no website or from specific 'NO_URL' status
    url = f"{SUPABASE_URL}/rest/v1/empresas?or=(website.is.null,status.eq.NO_URL)&limit={limit}"
    response = requests.get(url, headers=get_headers())
    if response.status_code == 200:
        return response.json()
    log.error(f"ERR: Error fetching leads: {response.text}")
    return []

# ── ACTIVATION & REVERSE ICP ───────────────────────────────────────────────
def find_url_and_icp_signals(company_name):
    """Uses Serper to find the website and capture Reverse ICP clone signals."""
    if not SERPER_KEY:
        log.error("ERR: SERPER_KEY missing.")
        return None, []

    url = "https://google.serper.dev/search"
    headers = {'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json'}
    payload = json.dumps({"q": f"{company_name} official website fintech"})
    
    try:
        r = requests.post(url, headers=headers, data=payload, timeout=15)
        if r.status_code != 200:
            return None, []
        
        results = r.json()
        organic = results.get("organic", [])
        
        if not organic:
            return None, []
            
        # 1. PRIMARY URL: First result that looks like a corporate domain
        # Skip LinkedIn, Crunchbase, etc. for the primary URL
        official_url = None
        avoid_patterns = [r"linkedin\.com", r"crunchbase\.com", r"facebook\.com", r"twitter\.com", r"instagram\.com", r"youtube\.com"]
        
        for item in organic:
            link = item.get("link")
            if not any(re.search(p, link) for p in avoid_patterns):
                official_url = link
                break
        
        if not official_url:
            official_url = organic[0].get("link") # Fallback to first

        # 2. REVERSE ICP SIGNALS: Capture names of other companies in snippets
        clone_signals = []
        for item in organic[1:5]: # Check next few results
            snippet = item.get("snippet", "")
            title = item.get("title", "")
            # Look for "Similar to", "Competitors", or just capitalized names
            combined = f"{title} {snippet}"
            clone_signals.append({"source": item.get("link"), "context": combined})
            
        return official_url, clone_signals
        
    except Exception as e:
        log.error(f"ERR: Serper Error for {company_name}: {e}")
        return fallback_discovery_ddg(company_name)

def fallback_discovery_ddg(company_name):
    """Fallback: Scrapes DuckDuckGo through Scrape.do proxies to find a URL."""
    if not SCRAPEDO_KEY:
        return None, []
        
    log.info(f"🔄 FALLBACK [DDG]: Searching for {company_name}...")
    target_url = f"https://duckduckgo.com/html/?q={requests.utils.quote(company_name + ' official website')}"
    proxy_url = f"http://api.scrape.do?token={SCRAPEDO_KEY}&url={target_url}"
    
    try:
        r = requests.get(proxy_url, timeout=20)
        if r.status_code != 200:
            return None, []
            
        # Extract first link that isn't duckduckgo itself
        # DDG HTML links are usually in <a> tags within 'result__a' class
        # But even a simple regex for URLs might work as a quick hack
        html = r.text
        urls = re.findall(r'href="(https?://[^"]+)"', html)
        
        avoid_patterns = [r"duckduckgo\.com", r"linkedin\.com", r"crunchbase\.com", r"facebook\.com", r"twitter\.com"]
        official_url = None
        for u in urls:
            if not any(re.search(p, u) for p in avoid_patterns):
                official_url = u
                break
        
        if official_url:
            log.info(f"✨ RECOVERY: Found URL for {company_name} via DDG: {official_url}")
            return official_url, []
            
        return None, []
    except Exception as e:
        log.error(f"ERR: Fallback Error for {company_name}: {e}")
        return None, []

def activate_lead(lead):
    lid = lead.get("id")
    name = lead.get("name")
    
    # QUALITY FILTER: Skip long descriptions, generic patterns or ICP segments
    junk_patterns = [
        r"que buscan", r"empresa de", r"plataforma para", 
        r"solución de", r"instituciones financieras", r"en busca de",
        r"ej\.", r"pyme", r"fintechs", r"empresa que", r"individuos",
        r"comerciantes", r"consultoras", r"corretoras", r"plataformas de",
        r"sub-bancarizados", r"bancarizados"
    ]
    
    word_count = len(name.split())
    if word_count > 5 or any(re.search(p, name, re.I) for p in junk_patterns):
        log.warning(f"⏩ SKIP [Junk/Descriptive]: {name[:40]}...")
        payload_junk = {"status": "JUNK", "scan_error": "DESCRIPTIVE_OR_ICP_SEGMENT"}
        requests.patch(f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{lid}", headers=get_headers(), json=payload_junk)
        return False

    log.info(f"SCAN: Activating: {name}...")
    website, clones = find_url_and_icp_signals(name)
    
    if website:
        # Prepare Reverse ICP Metadata
        icp_metadata = {
            "clones_detected": len(clones),
            "signals": clones[:3], # Top 3 competitors/clones
            "discovery_date": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        payload = {
            "website": website,
            "status": "PENDIENTE", # Wake up the Sniper!
            "reverse_icp_links": json.dumps(icp_metadata),
            "last_scan": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        
        r = requests.patch(f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{lid}", headers=get_headers(), json=payload)
        if r.status_code in [200, 204]:
            log.info(f"OK: ACTIVATED: {name} -> {website}")
            return True
    else:
        log.warning(f"WARN: FAILED to find URL for: {name}")
        return False

# ── ORCHESTRATOR ──────────────────────────────────────────────────────────
def run_activation():
    leads = fetch_dormant_leads(2000) # Increased to 2000 for high-volume purge
    if not leads:
        print("OK: No more dormant leads found.")
        return

    print(f"RUN: Activating {len(leads)} leads with 8-core concurrency...")
    
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(activate_lead, l): l for l in leads}
        for future in as_completed(futures):
            future.result()

if __name__ == "__main__":
    run_activation()
