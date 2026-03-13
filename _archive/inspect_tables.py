import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def inspect_schema():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }
    
    # Intentamos obtener un solo registro para ver la estructura
    # Probamos con la tabla 'processed_leads' que es la que definí yo
    # Y también con 'fintech_leads' que apareció en el error de log
    for table in ["processed_leads", "fintech_leads"]:
        print(f"\n--- INSPECCIONANDO TABLA: {table} ---")
        try:
            r = requests.get(f"{url}/rest/v1/{table}?select=*&limit=1", headers=headers)
            if r.status_code == 200:
                data = r.json()
                if data:
                    print(f"[OK] Estructura detectada en '{table}':")
                    for k in data[0].keys():
                        print(f"  - {k}")
                else:
                    print(f"[EMPTY] La tabla '{table}' está vacía, no puedo ver columnas.")
            else:
                print(f"[ERROR] No se pudo leer '{table}': {r.status_code}")
        except Exception as e:
            print(f"[EXCEPTION] {e}")

if __name__ == "__main__":
    inspect_schema()
