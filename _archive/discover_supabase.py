import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def discover_all_tables():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }
    
    print("--- DESCUBRIENDO TABLAS EN SUPABASE ---")
    try:
        # Consultamos el esquema de PostgREST
        r = requests.get(f"{url}/rest/v1/", headers=headers, timeout=15)
        if r.status_code == 200:
            data = r.json()
            paths = data.get("paths", {})
            print("\nTablas/Endpoints encontrados:")
            for path in paths:
                if path.startswith("/"):
                    table_name = path[1:]
                    if not any(x in table_name for x in ["rpc", "rpc/", "/"]):
                        print(f"  - {table_name}")
                        # Intentamos contar registros en cada tabla
                        r_count = requests.get(f"{url}/rest/v1/{table_name}?select=id", headers={**headers, "Prefer": "count=exact"}, timeout=10)
                        count = r_count.headers.get("Content-Range", "0-0/0").split("/")[-1]
                        print(f"    Registros: {count}")
        else:
            print(f"[ERROR] No se pudo obtener el esquema: {r.status_code}")
    except Exception as e:
        print(f"[EXCEPTION] {e}")

if __name__ == "__main__":
    discover_all_tables()
