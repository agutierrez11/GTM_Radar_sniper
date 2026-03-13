import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def test_rest_api():
    print("--- PROBANDO SUPABASE REST API ---")
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("[ERROR] Faltan credenciales en el .env")
        return

    # Intentamos leer la tabla de leads (ajusta el nombre si es distinto)
    # Por defecto probamos con la tabla 'leads' o similar
    target_table = "processed_leads" # Cambia esto si conoces el nombre real
    
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    try:
        # Primero probamos un simple GET al root de la API
        print(f"Probando conexión a {url}/rest/v1/...")
        r = requests.get(f"{url}/rest/v1/", headers=headers, timeout=10)
        if r.status_code == 200:
            print("[SUCCESS] ¡Conexión HTTP Exitosa! La API responde.")
            
            # Intentamos ver si la tabla existe
            print(f"Verificando acceso a tablas...")
            r_tables = requests.get(f"{url}/rest/v1/?select=*", headers=headers, timeout=10)
            print(f"Tablas detectadas (status {r_tables.status_code})")
            
        else:
            print(f"[FAIL] Error de API: {r.status_code} - {r.text}")
            
    except Exception as e:
        print(f"[CRITICAL] Error de red: {e}")

if __name__ == "__main__":
    test_rest_api()
