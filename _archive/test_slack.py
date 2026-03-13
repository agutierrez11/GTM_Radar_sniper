import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def test_slack():
    webhook = os.getenv("SLACK_WEBHOOK_URL")
    print(f"--- PROBANDO SLACK WEBHOOK ---")
    if not webhook:
        print("[ERROR] No hay SLACK_WEBHOOK_URL en el .env")
        return
    
    payload = {"text": "🚀 Sniper v4.1: Prueba de conexión desde la VM. Si lees esto, las alertas están activas."}
    try:
        r = requests.post(webhook, json=payload, timeout=10)
        if r.status_code == 200:
            print("[SUCCESS] Alerta enviada a Slack correctamente.")
        else:
            print(f"[FAIL] Error de Slack: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"[EXCEPTION] {e}")

if __name__ == "__main__":
    test_slack()
