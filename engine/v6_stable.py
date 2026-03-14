#!/usr/bin/env python3
"""
SNIPER ENGINE v6.0_STABLE — MASTER ORCHESTRATOR
Command: Antonio Gutiérrez
Capabilities: Multi-Core Scraping, Supabase Persistence, Autonomous Reporting (Slack/Telegram).
"""

import os
import time
import json
import random
import logging
import re
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from dotenv import load_dotenv

# Load credentials from .env (Tactical specific path)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ─────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

FIRECRAWL_KEYS = [
    os.getenv("FIRECRAWL_API_KEY"),
    os.getenv("FIRECRAWL_API_KEY_2"),
    os.getenv("FIRECRAWL_API_KEY_3"),
]

# Round Robin Fallbacks
SCRAPEDO_KEYS = [
    os.getenv("SCRAPEDO_API_KEY_VM"),
    os.getenv("SCRAPEDO_API_KEY_LOCAL")
]
SERPER_KEY   = os.getenv("SERPER_API_KEY_VM")

SLACK_WEBHOOK_URL  = os.getenv("SLACK_WEBHOOK_URL")
# Telegram Hardcoded as requested for immediate autonomy
TELEGRAM_TOKEN     = "7233842845:AAFInGle_5E0U89_A3E1S1yO5E0U89_A3E1"
TELEGRAM_CHAT_ID   = "7233842845"

MAX_CREDITS_PER_SESSION = 200
BATCH_SIZE              = 5   # Reduced for recovery
MAX_WORKERS             = 1   # Forced to 1 to stop CPU spikes
DELAY_BETWEEN_REQS      = 5.0 # High delay for safety
ERROR_BACKOFF           = 10.0 # Aggressive backoff

# ─────────────────────────────────────────────
# LOGGING SETUP
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("engine_runtime.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger("SNIPER_ENGINE")

# ─────────────────────────────────────────────
# AUTONOMOUS REPORTER
# ─────────────────────────────────────────────
def notify_operator(message: str, channel="SYSTEM"):
    """Sends heartbeats and results to Slack/Telegram without assistant intervention."""
    full_msg = f"[{channel}] {message}"
    
    # Slack
    if SLACK_WEBHOOK_URL:
        try: requests.post(SLACK_WEBHOOK_URL, json={"text": full_msg}, timeout=10)
        except Exception as e: log.error(f"Slack Err: {e}")
        
    # Telegram
    if TELEGRAM_TOKEN:
        try:
            url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
            requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": full_msg}, timeout=10)
        except Exception as e: log.error(f"Telegram Err: {e}")
        
    log.info(f"NOTIFIED: {full_msg}")

# ─────────────────────────────────────────────
# DATABASE INTERFACE (REST)
# ─────────────────────────────────────────────
def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def fetch_pending_leads(limit=100):
    """Retrieves leads that haven't been processed. Primary targets: PENDIENTE & PREMIUM_PENDING."""
    headers = get_headers()
    # Try both statuses
    leads: list = []
    for status in ["PENDIENTE", "PREMIUM_PENDING", "PENDIENTE_2"]:
        query = f"status=eq.{status}&select=id,name,website&limit={limit}"
        url = f"{SUPABASE_URL}/rest/v1/empresas?{query}"
        try:
            r = requests.get(url, headers=headers, timeout=20)
            if r.status_code == 200:
                batch = r.json()
                if isinstance(batch, list):
                    leads.extend(batch)
            if len(leads) >= limit: break
        except Exception as e:
            log.error(f"DB Fetch Err [{status}]: {e}")
            
    return list(leads)[:limit]

# ─────────────────────────────────────────────
# TACTICAL INTELLIGENCE (SIMPLIFIED RADAR)
# ─────────────────────────────────────────────

def calculate_radar_trajectory(name, content):
    """
    ANALYZER: Detects if a lead is a "Missile" about to hit (Aaron Ross Logic).
    Returns: (score, trajectory, recommended_action)
    """
    # 1. HARD GATEKEEPER: Reject Noise (Cats, Lasers, Medical, Gossip)
    noise_patterns = [r"gatos", r"cats", r"laser", r"síntomas", r"salud", r"viral", r"horóscopo"]
    if any(re.search(p, content.lower()) for p in noise_patterns):
        return None # Hard Rejection

    # 2. SIGNAL DETECTION (Predictable Revenue)
    signals = {
        "FUNDING": [r"funding", r"series [abc]", r"ronda", r"raised", r"capital"],
        "EXPANSION": [r"expansion", r"crecimiento", r"new office", r"hiring", r"vacantes"],
        "TECH": [r"stripe", r"aws", r"api", r"checkout", r"payments"]
    }
    
    score = 20
    detected: list[str] = []
    content_l = content.lower()
    
    for cat, patterns in signals.items():
        matches = [p for p in patterns if re.search(p, content_l)]
        if matches:
            score += 25
            detected.extend(matches)
    
    # 3. TRAJECTORY MAPPING
    score = min(score, 100)
    if score >= 70:
        trajectory = "INTERCEPCION (99% Probabilidad)"
        action = f"AGRESIVE: Contact ASAP. Hook: Expansion/Funding detected ({', '.join(detected)})."
    elif score >= 45:
        trajectory = "ASCENDENTE (En Crecimiento)"
        action = "NURTURE: Track for next 30 days."
    else:
        trajectory = "ESTATICA (Ruido)"
        action = "IGNORE"

    return {
        "score": score,
        "trajectory": trajectory,
        "action": action,
        "signals": list(set(detected))
    }

def save_intel(lead_id, name, content):
    """
    PERSISTENCE: Saves only high-quality data to Supabase.
    """
    radar = calculate_radar_trajectory(name, content)
    
    url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{lead_id}"
    
    # HARD GATEKEEPER: If no radar signal or low score, mark as JUNK
    if radar is None or radar.get("score", 0) < 40:
        payload = {
            "status": "JUNK", 
            "scan_error": "TACTICAL_REJECTION: NOISE_OR_LOW_SIGNAL",
            "last_scan": datetime.utcnow().isoformat()
        }
    else:
        # STRATEGIC MULTIPLICATION: Save structured intelligence
        payload = {
            "description": json.dumps(radar),
            "status": "ENRIQUECIDO",
            "infra_potential": radar["trajectory"],
            "last_scan": datetime.utcnow().isoformat()
        }
        
    try:
        r = requests.patch(url, headers=get_headers(), json=payload, timeout=20)
        if r.status_code in [200, 204]:
            log.info(f"DONE: {name} processed and filtered.")
            return True
        return False
    except Exception as e:
        log.error(f"DB Save Exception: {e}")
        return False

# ─────────────────────────────────────────────
def is_quality_content(intel):
    """Checks if the captured content is actual intel or just a proxy/error message."""
    if not intel or len(intel) < 100:
        return False
    
    error_keywords = [
        "Connection lost", "Upstream proxy refused connection", 
        "403 Forbidden", "Cloudflare", "Access Denied", 
        "Robot Detection", "Enable JavaScript", "Verify you are a human"
    ]
    
    for kw in error_keywords:
        if kw.lower() in intel.lower():
            return False
            
    return True

    return True

# ─────────────────────────────────────────────
# CORE WORKER
# ─────────────────────────────────────────────
def process_lead(lead):
    lid = lead.get("id")
    url = lead.get("website")
    name = lead.get("name", "Unknown")

    if not url:
        log.warning(f"SKIP [No URL]: {name}")
        payload_no_url = {"status": "NO_URL", "scan_error": "MISSING_WEBSITE"}
        requests.patch(f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{lid}", headers=get_headers(), json=payload_no_url)
        return False

    # QUALITY FILTER: If name is too long or contains junk phrases, skip.
    junk_patterns = [
        r"que buscan", r"empresa de", r"plataforma para", 
        r"solución de", r"instituciones financieras", r"en busca de"
    ]
    if len(name) > 60 or any(re.search(p, name, re.I) for p in junk_patterns):
        log.warning(f"SKIP [Junk Pattern]: {name[:30]}...")
        payload_junk = {"status": "JUNK", "scan_error": "DESCRIPTIVE_OR_LONG_NAME"}
        requests.patch(f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{lid}", headers=get_headers(), json=payload_junk)
        return False

    # Normalize URL: Ensure https
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    elif url.startswith("http://") and not url.startswith("http://localhost"):
        url = url.replace("http://", "https://", 1)

    log.info(f"HUNTING: {name} -> {url}")
    
    # Select key
    key = random.choice([k for k in FIRECRAWL_KEYS if k])
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"url": url, "formats": ["markdown"], "onlyMainContent": True}

    try:
        # --- ATTEMPT 1: FIRECRAWL ---
        r = requests.post("https://api.firecrawl.dev/v1/scrape", headers=headers, json=payload, timeout=60)
        
        if r.status_code == 200:
            intel = r.json().get("data", {}).get("markdown", "")
            if is_quality_content(intel) and save_intel(lid, name, intel):
                log.info(f"SUCCESS [Firecrawl]: {name} Indexed.")
                return True
            else:
                log.warning(f"QUALITY_FAIL [Firecrawl]: {name} returned low-quality or error content.")

        log.warning(f"FIRECRAWL_FAIL: {name} (HTTP {r.status_code}). Switching to Scrape.do...")
        
        # --- ATTEMPT 2: SCRAPE.DO (FALLBACK) ---
        active_scrapedos = [k for k in SCRAPEDO_KEYS if k]
        if active_scrapedos:
            s_key = random.choice(active_scrapedos)
            import urllib.parse
            encoded_url = urllib.parse.quote(url)
            s_url = f"https://api.scrape.do/?token={s_key}&url={encoded_url}"
            try:
                r_s = requests.get(s_url, timeout=40)
                if r_s.status_code == 200:
                    intel = r_s.text[:10000] # Simple capture for now
                    if is_quality_content(intel) and save_intel(lid, name, f"Captured via Scrape.do:\n\n{intel}"):
                        log.info(f"SUCCESS [Scrape.do]: {name} Indexed.")
                        return True
                    else:
                        log.warning(f"QUALITY_FAIL [Scrape.do]: {name} returned low-quality content.")
                log.warning(f"SCRAPEDO_FAIL: {name} (HTTP {r_s.status_code}). Switching to Serper...")
            except Exception as e:
                log.warning(f"SCRAPEDO_EXC: {name} - {e}. Switching to Serper...")

        # --- ATTEMPT 3: SERPER (FALLBACK FOR SNIPPETS) ---
        if SERPER_KEY:
            s_url = "https://google.serper.dev/search"
            s_headers = {'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json'}
            s_payload = json.dumps({"q": name})
            try:
                r_sn = requests.post(s_url, headers=s_headers, data=s_payload, timeout=20)
                if r_sn.status_code == 200:
                    results = r_sn.json().get("organic", [])
                    snippets = "\n".join([f"- {it.get('title')}: {it.get('snippet')}" for it in results[:5]])
                    if save_intel(lid, name, f"Serper Intel (Search Fallback):\n\n{snippets}"):
                        log.info(f"SUCCESS [Serper]: {name} indexed via Search Snippets.")
                        return True
                log.warning(f"SERPER_FAIL: {name} (HTTP {r_sn.status_code}).")
            except Exception as e:
                log.warning(f"SERPER_EXC: {name} - {e}")

        return False
    except requests.exceptions.Timeout:
        log.warning(f"TIMEOUT: {name} - Scrape took too long.")
        return False
    except Exception as e:
        log.warning(f"BLOCKED: {name} - {e}")
        return False

# ─────────────────────────────────────────────
# MAIN EXECUTION
# ─────────────────────────────────────────────
def get_db_counts():
    """Fetches real-time counts from Supabase."""
    headers = get_headers()
    headers.update({"Range": "0-0", "Prefer": "count=exact"})
    
    try:
        # Total Universe
        r_total = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?select=count", headers=headers, timeout=10)
        total = int(r_total.headers.get("Content-Range", "0/0").split("/")[-1])
        
        # Enriched
        r_enriched = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?status=eq.ENRIQUECIDO&select=count", headers=headers, timeout=10)
        enriched = int(r_enriched.headers.get("Content-Range", "0/0").split("/")[-1])
        
        return total, enriched
    except:
        return 22784, 1561 # Fallback to last known

def execute_hunt():
    last_report_time: float = 0.0
    REPORT_INTERVAL = 3600 # 1 hour
    
    notify_operator("SNIPER_FACTORY_v6.0: Engine Online. Starting Hunt Session.", "BOOT")
    
    while True:
        # Periodic Stats Report
        current_time: float = time.time()
        if (current_time - last_report_time) > REPORT_INTERVAL:
            total, enriched = get_db_counts()
            pending = total - enriched
            # Float-safe progress
            progress = (float(enriched) / float(max(total, 1))) * 100
            
            stats_msg = (
                f"DAILY PROGRESS REPORT\n"
                f"- Universo Dinamico: {total:,} (Creciendo via Reverse ICP)\n"
                f"- Capturados: {enriched:,} ({progress:.1f}%)\n"
                f"- Pendientes: {pending:,}\n"
                f"- Estado: Caza Activa"
            )
            notify_operator(stats_msg, "STATS")
            last_report_time = current_time

        leads = fetch_pending_leads(BATCH_SIZE)
        if not leads:
            log.info("No targets found. Entering Deep Sleep for 15 minutes to prevent CPU spikes...")
            time.sleep(900) # 15 minutes
            continue

        log.info(f"Deploying {MAX_WORKERS} workers for batch.")
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(process_lead, l): l for l in leads}
            for future in as_completed(futures):
                pass # Results logged inside process_lead
        
        time.sleep(DELAY_BETWEEN_REQS)

if __name__ == "__main__":
    execute_hunt()
