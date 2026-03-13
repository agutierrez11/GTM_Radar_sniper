import os
import requests
import psycopg2
import socket
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def test_outbound_network():
    print("--- TEST RED SALIENTE (VM HEALTH) ---")
    targets = [
        ("Google DNS", "8.8.8.8", 53),
        ("Firecrawl API", "api.firecrawl.dev", 443),
        ("Supabase Pooler", "aws-1-us-east-1.pooler.supabase.com", 6543)
    ]
    for name, host, port in targets:
        try:
            socket.create_connection((host, port), timeout=5)
            print(f"[OK] Conexión básica a {name} exitosa.")
        except Exception as e:
            print(f"[FAIL] Bloqueo detectado hacia {name}: {e}")

def test_supabase():
    print("\n--- TEST SUPABASE (DB) ---")
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("[FAIL] DATABASE_URL no encontrada.")
        return
    print(f"Probando: {db_url.split('@')[-1]}") # Solo mostramos el host por seguridad
    try:
        conn = psycopg2.connect(db_url, connect_timeout=5)
        print("[SUCCESS] Conexión a la base de datos establecida.")
        conn.close()
    except Exception as e:
        print(f"[FAIL] Error DB: {e}")

def test_firecrawl():
    print("\n--- TEST FIRECRAWL (API) ---")
    key = os.getenv("FIRECRAWL_API_KEY")
    if not key:
        print("[SKIP] No hay key configurada.")
        return
    try:
        r = requests.post("https://api.firecrawl.dev/v1/scrape", 
                         headers={"Authorization": f"Bearer {key}"}, 
                         json={"url": "https://google.com"},
                         timeout=10)
        if r.status_code == 200:
            print("[SUCCESS] Firecrawl Key OK.")
        else:
            print(f"[FAIL] Firecrawl respondió con {r.status_code}: {r.text[:50]}")
    except Exception as e:
        print(f"[FAIL] Error Firecrawl: {e}")

if __name__ == "__main__":
    test_outbound_network()
    test_supabase()
    test_firecrawl()
