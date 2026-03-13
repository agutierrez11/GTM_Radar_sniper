import os
import json
import requests
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
from dotenv import load_dotenv

load_dotenv('engine/.env')

# SLACK CONFIG
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_APP_TOKEN = os.getenv("SLACK_APP_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

app = App(token=SLACK_BOT_TOKEN)

def get_lead_score(company_name):
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    # Search by name (case-insensitive)
    url = f"{SUPABASE_URL}/rest/v1/empresas?name=ilike.*{company_name}*&limit=1"
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
    return "❌ No encontré esa empresa en la base de datos."

@app.message("pos brasil")
def message_pos(message, say):
    # Simulated response or call to a research function
    say("🔎 *Tendencias POS Brasil (Directo del Sniper)*:\n1. Pix por Aproximación (Feb 2025)\n2. SoftPOS / Tap-to-Pay\n3. Pix Automático/Garantizado.\n\n_Fuentes: Banco Central do Brasil, Brazil Journal._")

@app.event("message")
def handle_message_events(body, logger, say):
    text = body["event"].get("text", "").lower()
    if "score" in text:
        company = text.replace("score", "").strip()
        if company:
            say(get_lead_score(company))
        else:
            say("Dime el nombre de la empresa, ej: `score nubank`")
    elif "radar" in text:
        say("📡 *Radar del Día:* Mercado Bitcoin (Score 20), Fivvy (Score 20), Retorna (En proceso).")

if __name__ == "__main__":
    if not SLACK_APP_TOKEN or not SLACK_BOT_TOKEN:
        print("Faltan los tokens de Slack en el .env (SLACK_APP_TOKEN, SLACK_BOT_TOKEN)")
    else:
        print("Sniper Slack Listener is starting...")
        handler = SocketModeHandler(app, SLACK_APP_TOKEN)
        handler.start()
