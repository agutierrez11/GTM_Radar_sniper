#!/usr/bin/env python3
"""
ORQUESTADOR REST v4.1 — ANTIGRAVITY GTM SNIPER
Bypasses PostgreSQL Port Blocks via Supabase REST API (HTTPS/443).
Optimized for: fintech_leads table schema.
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

load_dotenv()

# ─────────────────────────────────────────────
# --- CONFIGURACIÓN DE CONEXIÓN ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

FIRECRAWL_KEYS = [
    os.getenv("FIRECRAWL_API_KEY"),
    os.getenv("FIRECRAWL_API_KEY_2"),
    os.getenv("FIRECRAWL_API_KEY_3"),
]

SLACK_WEBHOOK_URL  = os.getenv("SLACK_WEBHOOK_URL")
TELEGRAM_TOKEN     = "7233842845:AAFInGle_5E0U89_A3E1S1yO5E0U89_A3E1"
TELEGRAM_CHAT_ID   = "7233842845"

MAX_CREDITS_PER_SESSION = 100    # Sesion controlada para prueba
BATCH_SIZE              = 10
MAX_WORKERS             = 5
DELAY_BETWEEN_REQS      = 1.0

# ─────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("sniper_rest.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger("SNIPER")

# ─────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────
def send_alerts(message: str):
    if SLACK_WEBHOOK_URL:
        try: requests.post(SLACK_WEBHOOK_URL, json={"text": message}, timeout=5)
        except: pass
    if TELEGRAM_TOKEN:
        try:
            url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
            requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": message}, timeout=5)
        except: pass
    log.info(f"[ALERT]: {message}")

# ─────────────────────────────────────────────
# SUPABASE REST OPERATIONS
# ─────────────────────────────────────────────
def get_supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def get_pending_leads_rest(limit=100):
    """Obtiene leads pendientes vía REST API."""
    url = f"{SUPABASE_URL}/rest/v1/fintech_leads?raw_scraped_text=is.null&select=id,company_name,website_url&limit={limit}"
    try:
        r = requests.get(url, headers=get_supabase_headers(), timeout=15)
        if r.status_code == 200:
            return r.json()
        else:
            log.error(f"[REST_API] Error al leer leads: {r.status_code} - {r.text}")
            return []
    except Exception as e:
        log.error(f"[REST_API] Error de red al leer: {e}")
        return []

def update_lead_rest(lead_id, content, status_val="SUCCESS"):
    """Actualiza un lead vía REST API (PATCH)."""
    url = f"{SUPABASE_URL}/rest/v1/fintech_leads?id=eq.{lead_id}"
    payload = {
        "raw_scraped_text": content,
        "estado": status_val, # Usamos 'estado' que es la columna real
        "created_at": datetime.now().isoformat() # Opcional, si quieres trackear tiempo
    }
    try:
        r = requests.patch(url, headers=get_supabase_headers(), json=payload, timeout=15)
        if r.status_code in [200, 204]:
            return True
        else:
            log.error(f"[REST_API] Error al actualizar lead {lead_id}: {r.status_code} - {r.text}")
            return False
    except Exception as e:
        log.error(f"[REST_API] Error de red al actualizar: {e}")
        return False

# ─────────────────────────────────────────────
# SCRAPING CORE
# ─────────────────────────────────────────────
def scrape_lead(lead):
    url = lead.get("website_url")
    if not url: return False
    
    key = random.choice([k for k in FIRECRAWL_KEYS if k])
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"url": url, "formats": ["markdown"]}
    
    try:
        r = requests.post("https://api.firecrawl.dev/v1/scrape", headers=headers, json=payload, timeout=40)
        r.raise_for_status()
        data = r.json().get("data", {}).get("markdown", "")
        
        # Guardar en Supabase via REST
        if update_lead_rest(lead["id"], data):
            log.info(f"OK: {lead['company_name']}")
            return True
        return False
    except Exception as e:
        log.warning(f"FAIL: {lead['company_name']} - {e}")
        return False

# ─────────────────────────────────────────────
# MAIN ENGINE
# ─────────────────────────────────────────────
def run_session():
    log.info("="*60)
    log.info(f"ORQUESTADOR REST v4.1 - ANTIGRAVITY Sniper")
    log.info("="*60)
    
    leads = get_pending_leads_rest(MAX_CREDITS_PER_SESSION)
    if not leads:
        log.info("No hay leads pendientes en Supabase (REST Check).")
        return

    send_alerts(f"SNIPER_REST: Iniciando sesion de {len(leads)} leads.")
    
    success_count = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(scrape_lead, lead): lead for lead in leads}
        for future in as_completed(futures):
            try:
                if future.result():
                    success_count += 1
            except Exception as e:
                log.error(f"Thread Error: {e}")
            
            if success_count % 20 == 0 and success_count > 0:
                send_alerts(f"PROGRESO: {success_count} leads inyectados vía REST.")
            
            time.sleep(DELAY_BETWEEN_REQS)

    send_alerts(f"SESION COMPLETADA: {success_count} leads procesados exitosamente.")
    log.info(f"[FINISH]: {success_count} total en esta sesion.")

if __name__ == "__main__":
    run_session()
