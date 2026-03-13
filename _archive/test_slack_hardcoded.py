import requests

def test_hardcoded_slack():
    url = "https://hooks.slack.com/services/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"
    message = "🚨 SNIPER_DEBUG: Probando webhook encontrado en app.js"
    
    print(f"--- PROBANDO SLACK (HARDCODED) ---")
    try:
        r = requests.post(url, json={"text": message}, timeout=10)
        if r.status_code == 200:
            print("[SUCCESS] Mensaje enviado correctamente.")
        else:
            print(f"[FAIL] Error: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"[EXCEPTION] {e}")

if __name__ == "__main__":
    test_hardcoded_slack()
