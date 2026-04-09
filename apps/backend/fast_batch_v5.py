
import os
import json
import time
import requests
import logging
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

# Strategic Batch Cleaner v5.0 (Night Shift)
# Mission: Process 5,000 leads from Supabase -> Firecrawl Extract -> Obsidian v5 Standard

# Hardcoded Path for robustness in Night Shift
ENV_PATH = r"C:\Users\nerv_gtm\.gemini\antigravity\scratch\nexus-poc\engine\.env"
load_dotenv(ENV_PATH)

# ─────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# FIRECRAWL KEYS (Multi-Key Rotation)
FIRECRAWL_KEYS = [
    os.getenv("FIRECRAWL_API_KEY"),
    os.getenv("FIRECRAWL_API_KEY_2"),
    os.getenv("FIRECRAWL_API_KEY_3"),
    os.getenv("FIRECRAWL_API_KEY_4")
]
FIRECRAWL_KEYS = [k for k in FIRECRAWL_KEYS if k] # Filter out empty ones
current_key_index = 0

VAULT_PATH = r"C:\Users\nerv_gtm\.gemini\antigravity\scratch\NERV_V5_CLEAN_VAULT"
BATCH_SIZE = 50
MAX_LEADS = 5000
WORKERS = 10

log = logging.getLogger("NERV_NIGHT_SHIFT")

# CONFIGURACIÓN DE SEGURIDAD (ANTIGRAVITY SHIELD)
HEARTBEAT_FILE = os.path.join(VAULT_PATH, "00_Logs", "night_shift_heartbeat.md")
AUDIT_FILE = os.path.join(VAULT_PATH, "00_Logs", "lead_audit_log.csv")
os.makedirs(os.path.dirname(HEARTBEAT_FILE), exist_ok=True)
BLACKLIST_FILE = os.path.normpath(r"C:\Users\nerv_gtm\.gemini\antigravity\scratch\processed_ids.log")
MAX_SESSION_CREDITS = 200  # Límite duro por ejecución manual
stats = {
    "procesados_sesion": 0, 
    "sincronizados": 0, 
    "basura": 0, 
    "fallidos": 0, 
    "errores_consecutivos_db": 0, 
    "last_sync": datetime.now()
}

def get_blacklisted_ids():
    if not os.path.exists(BLACKLIST_FILE): return set()
    with open(BLACKLIST_FILE, "r") as f:
        return set(line.strip() for line in f if line.strip())

def blacklist_id(company_id):
    """Escribe el ID en disco inmediatamente para evitar re-procesamiento si el script muere."""
    with open(BLACKLIST_FILE, "a") as f:
        f.write(f"{company_id}\n")

def get_blacklisted_ids():
    if not os.path.exists(BLACKLIST_FILE): return set()
    with open(BLACKLIST_FILE, "r") as f:
        return set(line.strip() for line in f if line.strip())

def blacklist_id(company_id):
    with open(BLACKLIST_FILE, "a") as f:
        f.write(f"{company_id}\n")

def write_heartbeat():
    """Writes a summary to Obsidian for User verification."""
    with open(HEARTBEAT_FILE, "w", encoding="utf-8") as f:
        f.write(f"""# 💓 NERV Sentinel: Heartbeat
        
- **Último Latido**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Leads Procesados**: {stats['procesados_sesion']}
- **Fichas Creadas**: {stats['sincronizados']}
- **Basura Filtrada**: {stats['basura']}
- **Errores**: {stats['fallidos']}
- **Estado**: ✅ Corriendo
""")

def log_audit(lead_id, name, status, reason):
    """Logs the reason for any lead outcome (Success or Junk)."""
    file_exists = os.path.isfile(AUDIT_FILE)
    with open(AUDIT_FILE, "a", encoding="utf-8") as f:
        if not file_exists:
            f.write("timestamp,lead_id,name,status,reason\n")
        f.write(f'"{datetime.now().isoformat()}","{lead_id}","{name}","{status}","{reason}"\n')

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

def fetch_raw_leads(limit=100):
    """Fetches target leads with Signal (Website) that are not processed yet."""
    # Priority: Leads with valid URL that have not been enriched or marked as junk
    url = f"{SUPABASE_URL}/rest/v1/empresas?website=not.is.null&status=is.null&limit={limit}"
    try:
        r = requests.get(url, headers=get_headers(), timeout=20)
        leads = r.json() if r.status_code == 200 else []
        
        # If no new leads, look for those marked explicitly for re-processing or specific niches
        if not leads:
            url = f"{SUPABASE_URL}/rest/v1/empresas?status=eq.PENDIENTE&limit={limit}"
            r = requests.get(url, headers=get_headers(), timeout=20)
            leads = r.json() if r.status_code == 200 else []
            
        return leads
    except Exception as e:
        log.error(f"DB Fetch Error: {e}")
        return []

def update_lead_status(company_id, status="ENRIQUECIDO"):
    """Actualiza el estado y BLOQUEA el ID localmente."""
    url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{company_id}"
    payload = {"status": status, "last_scan": datetime.now().isoformat()}
    
    # PRIMERO BLOQUEAMOS LOCALMENTE (Si falla la red, el ID ya está en la blacklist local)
    blacklist_id(company_id)
    
    try:
        r = requests.patch(url, headers=get_headers(), json=payload, timeout=10)
        if r.status_code == 204:
            stats["errores_consecutivos_db"] = 0
            return True
        else:
            log.error(f"!! FALLO CRÍTICO DB !! ID {company_id} respondió {r.status_code}: {r.text}")
            stats["errores_consecutivos_db"] += 1
            return False
    except Exception as e:
        log.error(f"Excepción en Update para ID {company_id}: {e}")
        stats["errores_consecutivos_db"] += 1
        return False

# ─────────────────────────────────────────────
# FIRECRAWL EXTRACT LOGIC (THE "IA" LAYER)
# ─────────────────────────────────────────────
def get_current_key():
    global current_key_index
    return FIRECRAWL_KEYS[current_key_index % len(FIRECRAWL_KEYS)]

def rotate_key():
    global current_key_index
    current_key_index += 1
    log.warning(f"  [SENTINEL] Rotating Firecrawl Key. New Index: {current_key_index % len(FIRECRAWL_KEYS)}")

def extract_intelligence(company_name, url, retries=3):
    """Uses Firecrawl /extract with Multi-Key Rotation fallback."""
    if not url or url.lower() in ["none", "null", ""]:
        return None

    for attempt in range(retries):
        key = get_current_key()
        log.info(f"  [AI] Extracting Intel for: {company_name} (Attempt {attempt+1}, Key Index {current_key_index % len(FIRECRAWL_KEYS)})")
        
        payload = {
            "urls": [url],
            "prompt": f"""Eres el Nexus Architect. Tu valor es la Clasificación Semántica y el Análisis Predictivo (RaiSE).
            Analiza '{company_name}' bajo la TAXONOMÍA FINNOVISTA 2026 y el SALTO AL FUTURO:
            
            1. CLASIFICACIÓN AGNÓSTICA: Asigna a una de estas 12 verticales maestras: [Payments_&_Remittances, Lending, Tech_Infrastructure, Enterprise_Financial_Mgmt, Digital_Banking, Wealth_Management, Crypto_&_Blockchain, Open_Finance, Insurtech, Proptech, PFM, Crowdfunding]. NO mezcles industrias ni uses nombres de competidores como referencia.
            2. DIAGNÓSTICO PROFÉTICO: Analiza el riesgo operativo/regulatorio SIN mencionar marcas comerciales. Da el 'Pañuelo' (Modelo de Solución agnóstico como Orquestación, Rieles A2A, Stablecoins, KYC-First). PROHIBIDO: 'Engancharse' con marcas o alucinar por asociación.
            3. INTELIGENCIA DE NODO (Taxonomía): Clasifica en una de las 12 verticales Finnovista 2026. Determina el 'modelo_gtm' (Local: requiere entidad; Cross-border: MoR/Agregador/Payfac).
            4. ESTRATEGIA DE VENTA (Tiers): Asigna Tier basado en el ADN:
               - Tier 1 (Diamante): C-Level Engagement + MEDDICII.
               - Tier 2 (Oportunidad): SPIN/BANT.
               - Tier 3 (Volumen): Predictable Revenue + Speed-to-Lead.
            5. FILTRO DE INTEGRIDAD RaiSE: Cita evidencia fáctica. Si el sitio es basura o incoherente, marca 'is_fintech' como false. IGNORA cualquier sesgo de marca previa en la sesión. El análisis debe ser 100% independiente para cada entidad.
            6. MAPEO DE ECOSISTEMA (Exponencial): Identifica en la web:
               - Clientes Clave (Case studies/Trusted by): Extrae Nombre y URL.
               - Competidores Directos (Lookalikes): Extrae Nombre y URL si se mencionan.""",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "is_fintech": {"type": "boolean"},
                    "taxonomy": {
                        "type": "object",
                        "properties": {
                            "vertical_maestra": {"type": "string", "enum": ["Payments_&_Remittances", "Lending", "Tech_Infrastructure", "Enterprise_Financial_Mgmt", "Digital_Banking", "Wealth_Management", "Crypto_&_Blockchain", "Open_Finance", "Insurtech", "Proptech", "PFM", "Crowdfunding"]},
                            "nivel_madurez": {"type": "string", "enum": ["Seed", "Scale-up", "Unicorn", "Legacy", "Incumbent"]},
                            "rol_cadena": {"type": "string"},
                            "modelo_gtm": {
                                "type": "string",
                                "enum": ["Local", "Cross-border", "Híbrido", "Desconocido"],
                                "description": "Discriminador crítico sugerido por expertos: Local (requiere entidad) vs Cross-border (MoR/Agregador)."
                            }
                        }
                    },
                    "diagnostico_profetico": {
                        "type": "object",
                        "properties": {
                            "dolor_hoy": {"type": "string"},
                            "pronostico_gripe": {"type": "string"},
                            "el_panuelo": {"type": "string"}
                        }
                    },
                    "plan_ataque": {
                        "type": "object",
                        "properties": {
                            "tier": {"type": "string", "enum": ["Tier 1", "Tier 2", "Tier 3"]},
                            "metodologia": {"type": "string"},
                            "punto_esfuerzo": {"type": "string"},
                            "argumento_flanqueo": {"type": "string"}
                        }
                    },
                    "estrategia_expansion": {
                        "type": "object",
                        "properties": {
                            "modelo": {"type": "string", "enum": ["Cross-border", "Local Acquiring"]},
                            "entidad_detectada": {"type": "boolean"},
                            "vector_entrada": {"type": "string"},
                            "recomendacion": {"type": "string"}
                        }
                    },
                    "ecosistema": {
                        "type": "object",
                        "properties": {
                            "clientes_detectados": {
                                "type": "array", 
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "nombre": {"type": "string"},
                                        "url": {"type": "string"}
                                    }
                                }
                            },
                            "competidores_lookalike": {
                                "type": "array", 
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "nombre": {"type": "string"},
                                        "url": {"type": "string"}
                                    }
                                }
                            }
                        }
                    },
                    "audit": {
                        "type": "object",
                        "properties": {
                            "certeza": {"type": "integer", "minimum": 1, "maximum": 5},
                            "fuente_url": {"type": "string"},
                            "abogado_diablo": {"type": "string"}
                        }
                    }
                },
                "required": ["is_fintech", "taxonomy", "diagnostico_profetico", "plan_ataque", "estrategia_expansion", "ecosistema", "audit"]
            }
        }
        
        headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        try:
            r = requests.post("https://api.firecrawl.dev/v1/extract", headers=headers, json=payload, timeout=90)
            if r.status_code == 200:
                return r.json().get("data", {})
            elif r.status_code in [402, 429]:
                rotate_key()
                time.sleep(2)
            else:
                log.error(f"  [AI] Firecrawl Error {r.status_code}: {r.text}")
                break # Non-recoverable error
        except Exception as e:
            log.error(f"  [AI] Request Exception for {company_name}: {e}")
            time.sleep(2)
            
    return None

# ─────────────────────────────────────────────
# OBSIDIAN SYNC (VISUAL V5 / SPEED-TO-LEAD)
# ─────────────────────────────────────────────
def sync_to_obsidian(intel):
    """Transforms JSON intel into a Visual Concept Map (Heuristica-style)."""
    name = intel.get("name", "Unknown")
    country = intel.get("country_of_origin", "Unknown")
    
    # Pillar 4: Solutions as Hub Nodes (El Antídoto)
    panuelo = intel.get('diagnostico_profetico', {}).get('el_panuelo', '??')
    if panuelo != "??" and "[[" not in panuelo:
        panuelo = f"[[{panuelo}]]"

    # Generating the Heuristica-style Concept Map (Mermaid)
    vert_m = intel.get('taxonomy', {}).get('vertical_maestra', 'Fintech')
    reg_m = intel.get('audit', {}).get('regulacion_mariposa', 'Regulación')
    
    mermaid_lines = [
        "graph TD",
        f'    Co["[[{name}]]"] --> P["[[{country}]]"]',
        f'    Co --> V["[[{vert_m}]]"]',
        f'    Co --> S["{panuelo}"]',
        f'    Co --> R["[[{reg_m}]]"]',
        '    V --> Ind["[[Industrias_Fintech]]"]',
        '    S --> Sol["[[Soluciones_Maestras]]"]'
    ]
    mermaid_block = "```mermaid\n" + "\n".join(mermaid_lines) + "\n```"

    # Pre-formatting lists to avoid backslashes in f-string (Python 3.11 restriction)
    clients_list = "\n".join([f"- [{c.get('nombre')}]({c.get('url')})" for c in intel.get('ecosistema', {}).get('clientes_detectados', [])])
    competitors_list = "\n".join([f"- [{c.get('nombre')}]({c.get('url')})" for c in intel.get('ecosistema', {}).get('competidores_lookalike', [])])
    reg_tag = reg_m.replace(' ', '_')

    # Building content block by block for safety
    header = f"# [[{name}]]\n\n{mermaid_block}\n\n"
    
    diag = "## 🔮 Diagnóstico Profético (El Salto al Futuro)\n"
    diag += f"- **Estado Actual (Dolor hoy):** {intel.get('diagnostico_profetico', {}).get('dolor_hoy')}\n"
    diag += f"- **Pronóstico de 'Gripe':** {intel.get('diagnostico_profetico', {}).get('pronostico_gripe')}\n"
    diag += f"- **El Antídoto (Solución):** {panuelo}\n\n"
    
    strat = "## 🗺️ Estrategia de Expansión (Nexus Architect)\n"
    strat += f"- **Modelo GTM:** # {intel.get('taxonomy', {}).get('modelo_gtm', 'Desconocido')}\n"
    strat += f"- **Entidad detectada:** {'Sí' if intel.get('estrategia_expansion', {}).get('entidad_detectada') else 'No'}\n"
    strat += f"- **Vector de Entrada:** [[{vert_m}]] en [[{country}]]\n"
    strat += f"- **Recomendación:** {intel.get('estrategia_expansion', {}).get('recomendacion')}\n\n"
    
    mil = "## ⚔️ Plan de Ataque Militar (Schwerpunkt)\n"
    mil += f"- **Metodología Seleccionada:** [[{intel.get('plan_ataque', {}).get('metodologia')}]]\n"
    mil += f"- **Punto de Esfuerzo:** {intel.get('plan_ataque', {}).get('punto_esfuerzo')}\n"
    mil += f"- **Argumento de Flanqueo:** {intel.get('plan_ataque', {}).get('argumento_flanqueo')}\n\n"
    
    taxo = "## 🏛️ Inteligencia de Nodo (Taxonomía Finnovista)\n"
    taxo += f"- **Vertical Maestra**: [[{vert_m}]]\n"
    taxo += f"- **Nivel de Madurez**: [[{intel.get('taxonomy', {}).get('nivel_madurez')}]]\n"
    taxo += f"- **Rol en la Cadena**: [[{intel.get('taxonomy', {}).get('rol_cadena')}]]\n"
    taxo += f"- **Regulación Vinculada**: [[{reg_m}]]\n\n"
    
    eco = "## 🌐 ADN del Ecosistema (Crecimiento Exponencial)\n"
    eco += "### Clientes Detectados:\n" + clients_list + "\n\n"
    eco += "### Competidores Lookalike:\n" + competitors_list + "\n\n"
    
    audit = "## 🛡️ Auditoría de Sesgos (RaiSE)\n"
    audit += f"- **Certeza**: {intel.get('audit', {}).get('certeza')}/5\n"
    audit += f"- **Fuente**: [Link]({intel.get('audit', {}).get('fuente_url')})\n"
    audit += f"- **Abogado del Diablo**: {intel.get('audit', {}).get('abogado_diablo')}\n\n"
    
    tags = f"**Tags**: #fintech #[[{name}]] #sismografo #salto-al-futuro #predictive-nexus #regulación-[[{reg_tag}]]"

    content = header + diag + strat + mil + taxo + eco + audit + tags
    
    filename = f"{name.replace('/', '_')}.md"
    target_path = os.path.join(VAULT_PATH, "01_Entidades", filename)
    
    try:
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(content)
        log.info(f"  [SYNC] Visual Concept Map Created: {filename}")
        return True
    except Exception as e:
        log.error(f"  [SYNC] Failed to write {filename}: {e}")
        return False

# ─────────────────────────────────────────────
# PROCESSOR
# ─────────────────────────────────────────────
def process_lead(lead):
    name = lead.get("name", "Unknown")
    url = lead.get("website")
    lead_id = lead.get("id")
    
    stats["procesados_sesion"] += 1
    
    if not url or url.lower() in ["none", "null", ""]:
        stats["basura"] += 1
        log_audit(lead_id, name, "JUNK", "NO_WEBSITE")
        if lead_id: update_lead_status(lead_id, status="JUNK")
        return False

    if len(name) > 60:
        stats["basura"] += 1
        log_audit(lead_id, name, "JUNK", "NAME_TOO_LONG_JUNK")
        if lead_id: update_lead_status(lead_id, status="JUNK")
        return False
    
    try:
        intel = extract_intelligence(name, url)
        if intel and intel.get("is_fintech"):
            synced = sync_to_obsidian(intel)
            if synced:
                stats["sincronizados"] += 1
                stats["last_sync"] = datetime.now()
                log_audit(lead_id, name, "SUCCESS", "SYCHED_TO_OBSIDIAN")
                if lead_id: update_lead_status(lead_id)
                return True
        
        # If not fintech or extraction failed
        stats["basura"] += 1
        reason = "AI_FILTER_REJECTED" if intel else "EXTRACTION_FAILED"
        log_audit(lead_id, name, "JUNK", reason)
        if lead_id: update_lead_status(lead_id, status="JUNK")
        
    except Exception as e:
        stats["fallidos"] += 1
        log.error(f"Error processing {name}: {e}")
        log_audit(lead_id, name, "ERROR", str(e))
        
    return False

def firecrawl_search(query, limit=10):
    """Uses Firecrawl /search to find new target leads based on a mission."""
    key = get_current_key()
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {
        "query": f"fintech companies in {query} with details about products and website",
        "limit": limit
    }
    try:
        r = requests.post("https://api.firecrawl.dev/v1/search", headers=headers, json=payload, timeout=60)
        if r.status_code == 200:
            return r.json().get("data", [])
        else:
            log.error(f"Search Error {r.status_code}: {r.text}")
    except Exception as e:
        log.error(f"Search Exception: {e}")
    return []

def run_night_shift():
    log.info("=== OPERATION CLEAN HOUSE: NIGHT SHIFT STARTING ===")
    processed_this_session = get_blacklisted_ids()
    total_processed = 0
    
    while total_processed < MAX_LEADS:
        if stats["procesados_sesion"] >= MAX_SESSION_CREDITS:
            log.warning(f"🛑 LÍMITE DE PRESUPUESTO ALCANZADO ({MAX_SESSION_CREDITS}). Deteniendo para seguridad.")
            break

        # 1. PROCESS MISSIONS (MANUAL TRiggers from UI)
        url_missions = f"{SUPABASE_URL}/rest/v1/empresas?website=like.mission*&status=eq.PENDIENTE&limit=1"
        try:
            r_miss = requests.get(url_missions, headers=get_headers(), timeout=10)
            missions = r_miss.json() if r_miss.status_code == 200 else []
            for miss in missions:
                log.info(f"🚀 DETONANDO MISIÓN NEXUS: {miss.get('name')}")
                try:
                    desc_data = json.loads(miss.get('description', '{}'))
                    search_query = f"{desc_data.get('vertical')} in {desc_data.get('region')} {desc_data.get('angulo_ataque')}"
                    results = firecrawl_search(search_query)
                    
                    for res in results:
                        # Insert found leads as PENDIENTE
                        new_lead = {
                            "name": res.get("title", "Found Lead"),
                            "website": res.get("url"),
                            "status": "PENDIENTE",
                            "description": f"MISSION_FOUND: {miss.get('name')}"
                        }
                        requests.post(f"{SUPABASE_URL}/rest/v1/empresas", headers=get_headers(), json=new_lead)
                    
                    # Mark mission as ENRIQUECIDO (Completed)
                    update_lead_status(miss.get('id'), status="ENRIQUECIDO")
                    log.info(f"✅ Misión {miss.get('name')} procesada. {len(results)} leads inyectados.")
                except Exception as e:
                    log.error(f"Falla en Misión: {e}")
                    update_lead_status(miss.get('id'), status="ERROR_MISSION")
        except: pass

        if stats["errores_consecutivos_db"] > 3:
            log.error("🛑 CIRCUIT BREAKER: Demasiados fallos de sincronización con Supabase. Deteniendo para evitar bucles.")
            break

        raw_leads = fetch_raw_leads(BATCH_SIZE)
        if not raw_leads:
            log.info("No more leads found in Supabase. Mision Accomplished.")
            break
            
        # Hardened Deduplication (Memory + File)
        leads = [l for l in raw_leads if str(l.get("id")) not in processed_this_session]
        if not leads:
            log.info("All fetched leads were already processed this session. Waiting...")
            time.sleep(5)
            continue

        with ThreadPoolExecutor(max_workers=WORKERS) as executor:
            futures = {executor.submit(process_lead, l): l for l in leads}
            for future in as_completed(futures):
                lead_obj = futures[future]
                processed_this_session.add(str(lead_obj.get("id")))
                if future.result():
                    total_processed += 1
        
        # Sentinel Pulse
        write_heartbeat()
        
        log.info(f"Progress: {total_processed} leads synced to Obsidian.")
        time.sleep(1)

if __name__ == "__main__":
    run_night_shift()
