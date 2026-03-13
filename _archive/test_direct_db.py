import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def test_direct_bypass():
    print("--- TEST DIRECT HOST BYPASS ---")
    
    password = "Beshaa_Tovah"
    user = "postgres" # Para el host directo suele ser solo 'postgres'
    dbname = "postgres"
    host = "db.bwbatonvkfcjkfvhcwtc.supabase.co" # HOST DIRECTO
    
    print(f"Probando conexión DIRECTA a {host}...")
    try:
        conn = psycopg2.connect(
            host=host,
            port=5432,
            user=user,
            password=password,
            dbname=dbname,
            sslmode='require',
            connect_timeout=10
        )
        print("[SUCCESS] ¡CONEXIÓN DIRECTA EXITOSA!")
        conn.close()
    except Exception as e:
        print(f"[FAIL] Error en conexión directa: {e}")

if __name__ == "__main__":
    test_direct_bypass()
