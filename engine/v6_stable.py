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
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv()

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

SLACK_WEBHOOK_URL  = os.getenv("SLACK_WEBHOOK_URL")
# Telegram Hardcoded as requested for immediate autonomy
TELEGRAM_TOKEN     = "7233842845:AAFInGle_5E0U89_A3E1S1yO5E0U89_A3E1"
TELEGRAM_CHAT_ID   = "7233842845"

MAX_CREDITS_PER_SESSION = 200
BATCH_SIZE              = 20
MAX_WORKERS             = 10
DELAY_BETWEEN_REQS      = 0.5 

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
    """Retrieves leads that haven't been processed."""
    query = "raw_scraped_text=is.null&select=id,name,website&limit=" + str(limit)
    url = f"{SUPABASE_URL}/rest/v1/empresas?{query}"
    try:
        r = requests.get(url, headers=get_headers(), timeout=20)
        return r.json() if r.status_code == 200 else []
    except Exception as e:
        log.error(f"DB Fetch Err: {e}")
        return []

def save_intel(lead_id, content):
    """Persists extracted intelligence to Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{lead_id}"
    payload = {
        "description": content,
        "status": "VERIFIED",
        "updated_at": datetime.utcnow().isoformat()
    }
    try:
        r = requests.patch(url, headers=get_headers(), json=payload, timeout=20)
        return r.status_code in [200, 204]
    except Exception as e:
        log.error(f"DB Save Err: {e}")
        return False

# ─────────────────────────────────────────────
# CORE WORKER
# ─────────────────────────────────────────────
def process_lead(lead):
    lid = lead.get("id")
    url = lead.get("website")
    name = lead.get("name", "Unknown")

    if not url: return False

    log.info(f"HUNTING: {name} -> {url}")
    
    # Select key
    key = random.choice([k for k in FIRECRAWL_KEYS if k])
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"url": url, "formats": ["markdown"], "onlyMainContent": True}

    try:
        r = requests.post("https://api.firecrawl.dev/v1/scrape", headers=headers, json=payload, timeout=60)
        r.raise_for_status()
        intel = r.json().get("data", {}).get("markdown", "")
        
        if save_intel(lid, intel):
            log.info(f"SUCCESS: {name} Indexed.")
            return True
        return False
    except Exception as e:
        log.warning(f"BLOCKED: {name} - {e}")
        return False

# ─────────────────────────────────────────────
# MAIN EXECUTION
# ─────────────────────────────────────────────
def execute_hunt():
    notify_operator("SNIPER_FACTORY_v6.0: Engine Online. Starting Hunt Session.", "BOOT")
    
    leads = fetch_pending_leads(MAX_CREDITS_PER_SESSION)
    if not leads:
        notify_operator("Ambush complete. No pending targets in perimeter.", "STATUS")
        return

    notify_operator(f"Detected {len(leads)} targets. Deploying {MAX_WORKERS} workers.", "HUNT")
    
    success = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_lead, l): l for l in leads}
        for future in as_completed(futures):
            if future.result(): success += 1
            time.sleep(DELAY_BETWEEN_REQS)

    notify_operator(f"Session Finished. Captured: {success}/{len(leads)} targets.", "REPORT")

if __name__ == "__main__":
    execute_hunt()
