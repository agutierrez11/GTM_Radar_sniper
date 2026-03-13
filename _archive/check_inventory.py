import os
import requests
import psycopg2
import time
from dotenv import load_dotenv

load_dotenv()

def test_alerts():
    print("--- Probando Alertas ---")
    slack_url = os.getenv("SLACK_WEBHOOK_URL")
    tg_token = os.getenv("TELEGRAM_TOKEN")
    tg_chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    msg = "SNIPER DIAGNOSTICO: Prueba de conexion desde la VM de Antonio."
    
    if slack_url:
        try:
            r = requests.post(slack_url, json={"text": msg}, timeout=10)
            print(f"Slack Status: {r.status_code}")
        except Exception as e: print(f"Error Slack: {e}")
    else: print("Slack URL no configurada.")
        
    if tg_token and tg_chat_id:
        try:
            url = f"https://api.telegram.org/bot{tg_token}/sendMessage"
            r = requests.post(url, json={"chat_id": tg_chat_id, "text": msg}, timeout=10)
            print(f"Telegram Status: {r.status_code}")
        except Exception as e: print(f"Error Telegram: {e}")
    else: print("Telegram Config incompleta.")

def count_leads():
    print("\n--- Inventario en Supabase ---")
    db_url = os.getenv("DATABASE_URL")
    try:
        start_time = time.time()
        conn = psycopg2.connect(db_url)
        print(f"Sincronizacion establecida en {time.time() - start_time:.2f}s")
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) FROM fintech_leads")
        total = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM fintech_leads WHERE raw_scraped_text IS NOT NULL")
        completos = cur.fetchone()[0]
        
        print(f"TOTAL REGISTROS: {total}")
        print(f"SANEADOS (Data OK): {completos}")
        print(f"PENDIENTES: {total - completos}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error de Base de Datos: {e}")

if __name__ == "__main__":
    test_alerts()
    count_leads()
