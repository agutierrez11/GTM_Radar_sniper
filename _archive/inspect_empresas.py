import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../engine/.env'))

def inspect_empresas_schema():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }
    
    print("--- INSPECCIONANDO COLUMNAS DE 'empresas' ---")
    try:
        # Pidiendo un registro para ver las llaves reales
        r = requests.get(f"{url}/rest/v1/empresas?select=*&limit=1", headers=headers, timeout=10)
        if r.status_code == 200:
            data = r.json()
            if data:
                print("Columnas detectadas:")
                for k in data[0].keys():
                    print(f"  - {k}")
            else:
                print("La tabla está vacía.")
        else:
            print(f"Error: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Excepción: {e}")

if __name__ == "__main__":
    inspect_empresas_schema()
