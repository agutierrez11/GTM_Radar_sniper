import os
import json
import logging
import asyncio
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# CONFIG
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# LOGGING
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("TelegramBot")

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

def get_raw_score(company_query):
    headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}
    url = f"{SUPABASE_URL}/rest/v1/empresas?name=ilike.*{company_query}*&limit=1"
    try:
        r = requests.get(url, headers=headers)
        if r.status_code == 200 and r.json():
            lead = r.json()[0]
            intel = {}
            if lead.get('description') and lead['description'].startswith('{'):
                try: intel = json.loads(lead['description'])
                except: pass
            return lead['name'], intel.get('sniper_score', 'N/A'), lead['status']
        return company_query, "N/A", "DESCONOCIDO"
    except: return company_query, "N/A", "ERROR"

from persona import TacticalPersona
from dossier_search import search_dossiers

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(TacticalPersona.get_greeting() + "\n\nPregúnteme por 'stats' o 'score [empresa]'.")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.lower()
    
    if "stats" in text or "estado" in text:
        total, enriched, junk = get_raw_stats()
        await update.message.reply_text(TacticalPersona.fluid_stats(total, enriched, junk), parse_mode='Markdown')
    elif "score" in text:
        company_query = text.replace("score", "").strip()
        if company_query:
            name, score, status = get_raw_score(company_query)
            await update.message.reply_text(TacticalPersona.fluid_score(name, score, status), parse_mode='Markdown')
        else:
            await update.message.reply_text("Comandante, especifique el objetivo. Ej: `score nubank`")
    elif "quien" in text and "eres" in text:
        await update.message.reply_text("Soy NERV Sniper, tu brazo ejecutor de inteligencia GTM.")
    else:
        snippet = search_dossiers(text)
        if snippet:
            await update.message.reply_text(TacticalPersona.fluid_dossier_answer(snippet), parse_mode='Markdown')
        else:
            # Catch-all: If not a command, not a dossier, and not a long noise, try a general smart response or acknowledging the hunt
            await update.message.reply_text(TacticalPersona.handle_noise(text))

if __name__ == '__main__':
    if not TELEGRAM_TOKEN or "TU_TOKEN" in TELEGRAM_TOKEN:
        logger.error("FATAL: No TELEGRAM_BOT_TOKEN valid in .env")
    else:
        application = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
        
        start_handler = CommandHandler('start', start)
        msg_handler = MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message)
        
        application.add_handler(start_handler)
        application.add_handler(msg_handler)
        
        logger.info("Telegram Bot (python-telegram-bot) Online...")
        application.run_polling()
