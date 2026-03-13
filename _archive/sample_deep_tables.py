import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def sample_new_tables():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }
    
    tables = ["empresas", "market_gaps", "relaciones"]
    
    for table in tables:
        print(f"\n--- MUESTRA DE TABLA: {table} ---")
        try:
            r = requests.get(f"{url}/rest/v1/{table}?select=*&limit=5", headers=headers, timeout=10)
            if r.status_code == 200:
                data = r.json()
                if data:
                    for i, row in enumerate(data):
                        print(f"Registro {i+1}: {row}")
                else:
                    print(f"La tabla '{table}' está vacía.")
            else:
                print(f"[ERROR] No se pudo leer '{table}': {r.status_code} - {r.text}")
        except Exception as e:
            print(f"[EXCEPTION] {e}")

if __name__ == "__main__":
    sample_new_tables()
