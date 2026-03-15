import os
import time
import json
import random
import logging
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from urllib.parse import quote
from dotenv import load_dotenv

# Configuración de Rutas
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ─────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

FIRECRAWL_KEY = os.getenv("FIRECRAWL_API_KEY")
SCRAPE_DO_TOKEN = os.getenv("SCRAPE_DO_TOKEN")

BATCH_SIZE = 20
MAX_WORKERS = 8
DELAY_BETWEEN_BATCHES = 2.0

# ─────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("factory_runtime.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger("NERV_FACTORY")

# ─────────────────────────────────────────────
# DATABASE INTERFACE
# ─────────────────────────────────────────────
def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def fetch_pending_leads(limit=50):
    """Obtiene leads pendientes del universo."""
    # Eliminamos el orden por tier ya que la columna no existe en DB
    # Incluimos todos los status pendientes detectados
    query = "status=in.(CASCARON_PENDIENTE,HUNTING,PENDIENTE,PREMIUM_PENDING,NO_URL)&limit=" + str(limit)
    url = f"{SUPABASE_URL}/rest/v1/empresas?{query}"
    try:
        r = requests.get(url, headers=get_headers(), timeout=20)
        return r.json() if r.status_code == 200 else []
    except Exception as e:
        log.error(f"DB Fetch Err: {e}")
        return []

def update_lead_status(lead_id, payload):
    url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{lead_id}"
    try:
        requests.patch(url, headers=get_headers(), json=payload, timeout=20)
    except Exception as e:
        log.error(f"DB Update Err: {e}")

# ─────────────────────────────────────────────
# SEARCH ENGINE (URL DISCOVERY)
# ─────────────────────────────────────────────
def find_website_via_serper(company_name):
    """Busca la URL oficial de una empresa usando Serper."""
    serper_key = os.getenv("SERPER_API_KEY_VM") or os.getenv("SERPER_API_KEY")
    if not serper_key:
        return None
        
    log.info(f"  [Serper] Buscando URL oficial para: {company_name}")
    url = "https://google.serper.dev/search"
    headers = {'X-API-KEY': serper_key, 'Content-Type': 'application/json'}
    payload = json.dumps({"q": f"{company_name} official website"})
    
    try:
        r = requests.post(url, headers=headers, data=payload, timeout=20)
        if r.status_code == 200:
            results = r.json().get("organic", [])
            if results:
                found_url = results[0].get("link")
                log.info(f"    [!] URL encontrada: {found_url}")
                return found_url
    except Exception as e:
        log.error(f"  [Serper] Error buscando {company_name}: {e}")
    return None

# ─────────────────────────────────────────────
# CORE WORKER
# ─────────────────────────────────────────────
def process_lead(lead):
    lid = lead.get("id")
    name = lead.get("name", "Unknown")
    url = lead.get("website")
    
    # QUALITY FILTER: If name is too long, it's likely a description/junk
    if len(name) > 60:
        log.warning(f"  [SKIP] Junk Name detected: {name[:30]}...")
        update_lead_status(lid, {"status": "JUNK", "scan_error": "NAME_TOO_LONG"})
        return False

    # Si no tiene website y el status es NO_URL/PENDIENTE, intentamos descubrirlo
    if not url or url.lower() in ["none", "", "null"]:
        url = find_website_via_serper(name)
        if url:
            # Actualizamos el website en DB para futuras referencias
            update_lead_status(lid, {"website": url})
        else:
            log.warning(f"  [SKIP] No se pudo encontrar URL para {name}")
            # Marcamos como NO_URL para evitar re-intentos infinitos en este ciclo
            update_lead_status(lid, {"status": "NO_URL"})
            return False

    log.info(f"[*] Procesando: {name} -> {url}")

    # CAPA 1: FIRECRAWL
    success = False
    intel = ""
    
    try:
        fc_payload = {"url": url, "formats": ["markdown"], "onlyMainContent": True}
        fc_headers = {"Authorization": f"Bearer {FIRECRAWL_KEY}", "Content-Type": "application/json"}
        r = requests.post("https://api.firecrawl.dev/v1/scrape", headers=fc_headers, json=fc_payload, timeout=60)
        
        if r.status_code == 200:
            intel = r.json().get("data", {}).get("markdown", "")
            if intel and len(intel) > 200:
                success = True
                log.info(f"  [OK] Firecrawl exitoso para {name}")

        # CAPA 2: SCRAPE.DO (FALLBACK)
        if not success and SCRAPE_DO_TOKEN:
            log.warning(f"  [!] Fallback a Scrape.do para {name}")
            s_url = f"https://api.scrape.do/?token={SCRAPE_DO_TOKEN}&url={quote(url)}"
            r_s = requests.get(s_url, timeout=40)
            if r_s.status_code == 200:
                intel = r_s.text[:15000] # Captura extendida
                if len(intel) > 200:
                    success = True
                    log.info(f"  [OK] Scrape.do exitoso para {name}")

        if success:
            # Aquí se integrará la llamada al LLM para el refinamiento final
            # Por ahora marcamos como REFINERY para que el dashboard lo muestre procesando
            update_lead_status(lid, {
                "description": intel[:2000], # Guardamos snippet procesable
                "status": "REFINERY",
                "last_scan": datetime.utcnow().isoformat()
            })
            return True
        else:
            log.error(f"  [FAIL] No se pudo obtener intel para {name}")
            update_lead_status(lid, {"status": "FAILED_SCAN"})
            return False

    except Exception as e:
        log.error(f"  [EXC] Error en {name}: {e}")
        return False

# ─────────────────────────────────────────────
# ORCHESTRATOR
# ─────────────────────────────────────────────
def run_factory():
    log.info("=== NERV DATA FACTORY v1.0 ONLINE ===")
    
    while True:
        leads = fetch_pending_leads(BATCH_SIZE)
        if not leads:
            log.info("No hay objetivos pendientes en el cuadrante. Esperando expansión...")
            time.sleep(300)
            continue

        log.info(f"Desplegando {MAX_WORKERS} hilos para lote de {len(leads)} leads.")
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(process_lead, l): l for l in leads}
            for future in as_completed(futures):
                pass # Resultados gestionados por cada hilo
                
        log.info(f"Lote completado. Pausa de cortesía ({DELAY_BETWEEN_BATCHES}s)...")
        time.sleep(DELAY_BETWEEN_BATCHES)

if __name__ == "__main__":
    run_factory()
