import os
import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

# ── CONFIGURATION ──────────────────────────────────────────────────────────
load_dotenv(r"c:\Users\antonio\.gemini\antigravity\scratch\sniper-factory-master\engine\.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK_URL")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

def get_stats():
    """Aggregates high-value intelligence from Supabase."""
    now = datetime.utcnow()
    yesterday = (now - timedelta(days=1)).isoformat()
    
    # 1. TOTALS
    r_total = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?select=count", headers=headers)
    total_db = 0
    if r_total.status_code == 200:
        total_db = r_total.json()[0]['count'] if r_total.json() else 0

    # 2. ENRICHED TODAY
    r_enriched = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?status=eq.ENRIQUECIDO&last_scan=gte.{yesterday}", headers=headers)
    enriched_leads = r_enriched.json() if r_enriched.status_code == 200 else []

    # 3. MISSILES (Radar Score > 70)
    missiles = []
    for l in enriched_leads:
        try:
            desc = json.loads(l.get('description', '{}'))
            if desc.get('score', 0) >= 70:
                missiles.append(l)
        except: continue

    # 4. BLACK OPS (Social Intent)
    r_social = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?products_services=ilike.*INTENT_SIGNAL*&limit=5", headers=headers)
    social_hits = r_social.json() if r_social.status_code == 200 else []

    # 5. CONQUEST (Competitor Customers)
    r_conquest = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?reverse_icp_links=ilike.*conquest*&limit=5", headers=headers)
    conquest_hits = r_conquest.json() if r_conquest.status_code == 200 else []

    return {
        "total_db": total_db,
        "enriched_today": len(enriched_leads),
        "missiles": missiles[:5],
        "social": social_hits,
        "conquest": conquest_hits
    }

def send_to_slack():
    stats = get_stats()
    
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": "🌅 NERV SNIPER GTM: REPORTE MATUTINO (CANCUN)"}
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*Estado de la Cacería ({date_str})*\nEl motor de 8 núcleos ha procesado la base de datos intensivamente mientras descansabas."}
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Universo Total:* {stats['total_db']}"},
                {"type": "mrkdwn", "text": f"*Enriquecidos (24h):* {stats['enriched_today']}"}
            ]
        },
        {"type": "divider"}
    ]

    # ADD MISSILES
    if stats['missiles']:
        missile_text = "*🚀 MISILES DETECTADOS (Puntuación > 70):*\n"
        for m in stats['missiles']:
            missile_text += f"• *{m['name']}* ({m['website']})\n"
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": missile_text}})

    # ADD BLACK OPS
    if stats['social']:
        social_text = "*🕶️ BLACK OPS: INTENCIÓN SOCIAL (Reddit/Forums):*\n"
        for s in stats['social']:
            social_text += f"• *{s['name']}* - Señales de cambio detectadas.\n"
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": social_text}})

    # ADD CONQUEST
    if stats['conquest']:
        conquest_text = "*⚔️ COMPETITOR CONQUEST: CLIENTES CAPTURADOS:*\n"
        for c in stats['conquest']:
            conquest_text += f"• *{c['name']}* - Usa tecnología de la competencia.\n"
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": conquest_text}})

    payload = {"blocks": blocks}
    
    r = requests.post(SLACK_WEBHOOK, json=payload)
    if r.status_code == 200:
        print("OK: Slack report sent.")
    else:
        print(f"ERR: Slack failed: {r.status_code} - {r.text}")

if __name__ == "__main__":
    send_to_slack()
