import os
import requests
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def test_alerts():
    print("--- Probando Alertas ---")
    slack_url = os.getenv("SLACK_WEBHOOK_URL")
    tg_token = os.getenv("TELEGRAM_TOKEN")
    tg_chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    msg = "🚀 SNIPER DIAGNÓSTICO: Prueba de conexión desde la VM."
    
    if slack_url:
        try:
            r = requests.post(slack_url, json={"text": msg}, timeout=10)
            print(f"Slack: {r.status_code}")
        except Exception as e: print(f"Slack Error: {e}")
    else: print("Slack URL no configurada en .env")
        
    if tg_token and tg_chat_id:
        try:
            url = f"https://api.telegram.org/bot{tg_token}/sendMessage"
            r = requests.post(url, json={"chat_id": tg_chat_id, "text": msg}, timeout=10)
            print(f"Telegram: {r.status_code}")
        except Exception as e: print(f"Telegram Error: {e}")
    else: print("Telegram Config incompleta en .env")

def count_leads():
    print("\n--- Conteo de Leads en Supabase ---")
    db_url = os.getenv("DATABASE_URL")
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) FROM fintech_leads")
        total = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM fintech_leads WHERE raw_scraped_text IS NOT NULL")
        completos = cur.fetchone()[0]
        
        print(f"TOTAL LEADS: {total}")
        print(f"COMPLETOS (CON DATA): {completos}")
        print(f"PENDIENTES: {total - completos}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error DB: {e}")

if __name__ == "__main__":
    test_alerts()
    count_leads()
