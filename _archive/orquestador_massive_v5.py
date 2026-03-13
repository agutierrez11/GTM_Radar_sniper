#!/usr/bin/env python3
"""
ORQUESTADOR MASSIVE v5.0 — ANTIGRAVITY GTM SNIPER
- Source: Supabase 'empresas' table (22,784 leads)
- Path: REST API (Port 443)
- Concurrency: 20 Workers
- Alerts: Telegram (Slack Pending Config)
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

# --- SCALING PARAMETERS ---
MAX_CREDITS_PER_SESSION = 2000    # Bloque masivo
BATCH_SIZE              = 50      # Procesamiento por ráfagas
MAX_WORKERS             = 20      # Full Power (4 vCPUs)
DELAY_BETWEEN_REQS      = 0.3     # Optimizado para velocidad REST

# ─────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("sniper_massive.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger("SNIPER_V5")

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
            requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": f"🎯 SNIPER V5: {message}"}, timeout=5)
        except: pass
    log.info(f"[ALERT]: {message}")

# ─────────────────────────────────────────────
# SUPABASE REST OPERATIONS (EMPRESAS TABLE)
# ─────────────────────────────────────────────
def get_supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def get_pending_leads_rest(limit=2000):
    """Obtiene leads de la tabla 'empresas' donde description es null."""
    # Filtro: website no es nulo y description es nulo
    url = f"{SUPABASE_URL}/rest/v1/empresas?website=not.is.null&description=is.null&select=id,name,website&limit={limit}"
    try:
        r = requests.get(url, headers=get_supabase_headers(), timeout=20)
        if r.status_code == 200:
            return r.json()
        else:
            log.error(f"[REST_API] Error al leer empresas: {r.status_code} - {r.text}")
            return []
    except Exception as e:
        log.error(f"[REST_API] Error de red: {e}")
        return []

def update_company_rest(company_id, content):
    """Actualiza la descripción de la empresa vía REST API."""
    url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{company_id}"
    payload = {
        "description": content,
        "last_scan": datetime.now().isoformat()
    }
    try:
        r = requests.patch(url, headers=get_supabase_headers(), json=payload, timeout=15)
        return r.status_code in [200, 204]
    except Exception as e:
        log.error(f"[REST_API] Error al actualizar {company_id}: {e}")
        return False

# ─────────────────────────────────────────────
# SCRAPING CORE
# ─────────────────────────────────────────────
def scrape_company(company):
    url = company.get("website")
    if not url: return False
    
    # Rotación de llaves
    key = random.choice([k for k in FIRECRAWL_KEYS if k])
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"url": url, "formats": ["markdown"]}
    
    try:
        r = requests.post("https://api.firecrawl.dev/v1/scrape", headers=headers, json=payload, timeout=60)
        r.raise_for_status()
        data = r.json().get("data", {}).get("markdown", "")
        
        if update_company_rest(company["id"], data):
            log.info(f"✅ {company['name']}")
            return True
        return False
    except Exception as e:
        log.warning(f"❌ {company['name']} ({url}) - {e}")
        return False

# ─────────────────────────────────────────────
# MAIN ENGINE
# ─────────────────────────────────────────────
def run_massive_session():
    start_time = time.time()
    log.info("="*60)
    log.info(f"SNIPER MASSIVE v5.0 — INICIANDO COSECHA DE 22K LEADS")
    log.info("="*60)
    
    leads = get_pending_leads_rest(MAX_CREDITS_PER_SESSION)
    if not leads:
        log.info("No hay empresas pendientes para enriquecer.")
        return

    last_alert_time = time.time()
    send_alerts(f"COSECHA INICIADA: Bloque de {len(leads)} leads. Velocidad: {MAX_WORKERS} workers.")
    
    success_count = 0
    fail_count = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(scrape_company, l): l for l in leads}
        for future in as_completed(futures):
            try:
                if future.result():
                    success_count += 1
                else:
                    fail_count += 1
            except Exception as e:
                log.error(f"Thread Error: {e}")
            
            # Alertas por volumen (cada 100)
            if success_count % 100 == 0 and success_count > 0:
                elapsed = time.time() - start_time
                avg_speed = success_count / (elapsed / 60)
                # log.info? No, keep it as it was but maybe reduce frequency if requested
            
            # Alertas por tiempo (cada 30 minutos)
            current_time = time.time()
            if (current_time - last_alert_time) >= 1800: # 1800 segundos = 30 minutos
                elapsed = current_time - start_time
                avg_speed = success_count / (elapsed / 60) if elapsed > 0 else 0
                send_alerts(f"REPORTE 30 MIN: {success_count} exitosos. Velocidad: {avg_speed:.1f} leads/min. Total tiempo: {elapsed/60:.1f} mins.")
                last_alert_time = current_time
            
            time.sleep(DELAY_BETWEEN_REQS)

    total_time = (time.time() - start_time) / 60
    send_alerts(f"BLOQUE COMPLETADO: {success_count} exitosos, {fail_count} fallidos en {total_time:.1f} mins.")

if __name__ == "__main__":
    run_massive_session()
