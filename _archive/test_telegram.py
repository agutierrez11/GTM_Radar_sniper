import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_telegram(token=None, chat_id=None):
    token = token or os.getenv("TELEGRAM_TOKEN")
    chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID")
    message = "🚨 SNIPER_TEST: Verificando conexión de alertas V18.1"
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message}
    
    print(f"--- PROBANDO TELEGRAM ---")
    try:
        r = requests.post(url, json=payload, timeout=10)
        if r.status_code == 200:
            print("[SUCCESS] Mensaje de Telegram enviado con éxito.")
        else:
            print(f"[FAIL] Error de Telegram: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"[EXCEPTION] {e}")

if __name__ == "__main__":
    test_telegram()
