import os
import json
import requests
import logging
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
from dotenv import load_dotenv
from persona import TacticalPersona

# Load environment variables from .env in the same directory as the script
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# SLACK CONFIG
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_APP_TOKEN = os.getenv("SLACK_APP_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# LOGGING CONFIG
log_path = os.path.join(os.path.dirname(__file__), '..', 'slack_bot_internal.log')
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_path, mode='a', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("SlackBot")
logging.getLogger("slack_bolt").setLevel(logging.DEBUG)
logging.getLogger("slack_sdk").setLevel(logging.DEBUG)

logger.info("--- SLACK BOT INITIALIZING ---")

app = App(token=SLACK_BOT_TOKEN)

def get_lead_score(company_name):
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    # Search by name (case-insensitive)
    url = f"{SUPABASE_URL}/rest/v1/empresas?name=ilike.*{company_name}*&limit=1"
    try:
        r = requests.get(url, headers=headers)
        if r.status_code == 200 and r.json():
            lead = r.json()[0]
            intel = {}
            try:
                if lead.get('description') and lead['description'].startswith('{'):
                    intel = json.loads(lead['description'])
            except: pass
            
            score = intel.get('sniper_score', 'N/A')
            return f"🎯 *{lead['name']}*\n*Score Sniper:* {score}\n*Status:* {lead['status']}\n*Web:* {lead['website']}"
        return f"❌ No encontré '{company_name}' en la base de datos."
    except Exception as e:
        logger.error(f"Error fetching lead score: {e}")
        return "❌ Error consultando la base de datos."

@app.message("pos brasil")
def message_pos(message, say):
    say("🔎 *Tendencias POS Brasil (Directo del Sniper)*:\n1. Pix por Aproximación (Feb 2025)\n2. SoftPOS / Tap-to-Pay\n3. Pix Automático/Garantizado.\n\n_Fuentes: Banco Central do Brasil, Brazil Journal._")

def get_live_stats():
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Range': '0-0', 
        'Prefer': 'count=exact'
    }
    try:
        r_total = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?select=count", headers=headers, timeout=10)
        total = int(r_total.headers.get("Content-Range", "0/0").split("/")[-1])
        
        r_enriched = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?status=eq.ENRIQUECIDO&select=count", headers=headers, timeout=10)
        enriched = int(r_enriched.headers.get("Content-Range", "0/0").split("/")[-1])

        r_junk = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?status=eq.JUNK&select=count", headers=headers, timeout=10)
        junk = int(r_junk.headers.get("Content-Range", "0/0").split("/")[-1])
        
        active_universe = total - junk
        progress = (enriched / active_universe * 100) if active_universe > 0 else 0
        
        return (
            f"📊 *REPORTE TÁCTICO SNIPER*\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"🎯 *Universo Limpio:* {active_universe:,}\n"
            f"✅ *Enriquecidos:* {enriched:,} ({progress:.1f}%)\n"
            f"🗑️ *Basura Purgada:* {junk:,}\n"
            f"━━━━━━ ━━━━━━ ━━━━━━\n"
            f"📻 *NERV Station:* 8-Core Intel System"
        )
    except Exception as e:
        logger.error(f"Error getting live stats: {e}")
        return f"❌ Error al consultar Supabase: {e}"

def get_raw_stats():
    headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}', 'Range': '0-0', 'Prefer': 'count=exact'}
    try:
        r_total = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?select=count", headers=headers, timeout=10)
        total = int(r_total.headers.get("Content-Range", "0/0").split("/")[-1])
        
        r_enriched = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?status=eq.ENRIQUECIDO&select=count", headers=headers, timeout=10)
        enriched = int(r_enriched.headers.get("Content-Range", "0/0").split("/")[-1])
        
        r_junk = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?status=eq.JUNK&select=count", headers=headers, timeout=10)
        junk = int(r_junk.headers.get("Content-Range", "0/0").split("/")[-1])
        
        return total, enriched, junk
    except: return 0, 0, 0

def get_raw_score(company_name):
    headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}
    url = f"{SUPABASE_URL}/rest/v1/empresas?name=ilike.*{company_name}*&limit=1"
    try:
        r = requests.get(url, headers=headers)
        if r.status_code == 200 and r.json():
            lead = r.json()[0]
            intel = {}
            if lead.get('description') and lead['description'].startswith('{'):
                try: intel = json.loads(lead['description'])
                except: pass
            return lead['name'], intel.get('sniper_score', 'N/A'), lead['status']
        return company_name, "N/A", "DESCONOCIDO"
    except: return company_name, "N/A", "ERROR"

@app.event("message")
def handle_message_events(body, logger, say):
    logger.info(f"--- SLACK EVENT RECEIVED ---")
    logger.debug(f"FULL BODY: {json.dumps(body)}")
    
    event = body.get("event", {})
    # Ignore bot messages to prevent infinite loops
    if event.get("bot_id"):
        return
        
    text = event.get("text", "").lower()
    channel = event.get("channel")
    
    logger.info(f"Processing message: '{text}' in channel {channel}")
    
    if "stats" in text or "estado" in text:
        total, enriched, junk = get_raw_stats()
        say(TacticalPersona.fluid_stats(total, enriched, junk)) # Updated to include junk
    elif "score" in text:
        company_query = text.replace("score", "").strip()
        if company_query:
            name, score, status = get_raw_score(company_query)
            say(TacticalPersona.fluid_score(name, score, status))
        else:
            say("Comandante, especifique el objetivo. Ej: `score nubank`")
    elif "radar" in text:
        say("📡 *Radar del Día:* Mercado Bitcoin (Score 20), Fivvy (Score 20), Retorna (En proceso).")
    elif "ping" in text:
        say("pong 🎾")
    else:
        # Dossier Intelligence Fallback
        from dossier_search import search_dossiers
        snippet = search_dossiers(text)
        if snippet:
            logger.info("Dossier match found. Sending fluid answer.")
            say(TacticalPersona.fluid_dossier_answer(snippet))
        elif len(text.split()) > 3:
            logger.info("No dossier match. Sending noise handler.")
            say(TacticalPersona.handle_noise(text))
        else:
            logger.info("Message too short and no match. Ignoring.")

@app.event("app_mention")
def handle_app_mentions(body, logger, say):
    logger.info(f"Received app_mention event: {body}")
    say("¿En qué puedo ayudarte, Comandante? Prueba con `stats` o `score [empresa]`")

if __name__ == "__main__":
    if not SLACK_APP_TOKEN or not SLACK_BOT_TOKEN:
        logger.error("FATAL: Faltan los tokens de Slack en el .env (SLACK_APP_TOKEN, SLACK_BOT_TOKEN)")
    else:
        # Notify via Webhook that script is starting
        if os.getenv("SLACK_WEBHOOK_URL"):
            requests.post(os.getenv("SLACK_WEBHOOK_URL"), json={"text": "🚀 *Sniper Slack Bot:* Online and connecting..."})

        logger.info("Sniper Slack Listener is initializing SocketModeHandler...")
        try:
            handler = SocketModeHandler(app, SLACK_APP_TOKEN)
            logger.info("Connection established. Starting listener...")
            handler.start()
        except Exception as e:
            logger.exception(f"FATAL: SocketModeHandler failed to start: {e}")
