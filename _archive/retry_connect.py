import os
import psycopg2
import time
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def test_pooler_retry():
    print("--- RETRYING POOLER CONNECTION ---")
    
    password = "Beshaa_Tovah"
    # El usuario para el pooler DEBE ser el formato completo: postgres.PROYECTO
    user = "postgres.bwbatonvkfcjkfvhcwtc" 
    dbname = "postgres"
    host = "aws-1-us-east-1.pooler.supabase.com" 
    
    for port in [5432, 6543]:
        print(f"\nProbando Puerto {port}...")
        for attempt in range(3):
            try:
                print(f"Intento {attempt + 1}/3...")
                conn = psycopg2.connect(
                    host=host,
                    port=port,
                    user=user,
                    password=password,
                    dbname=dbname,
                    sslmode='require',
                    connect_timeout=15
                )
                print(f"[SUCCESS] ¡CONECTADO AL PUERTO {port}!")
                conn.close()
                return
            except Exception as e:
                print(f"[FAIL] {e}")
                time.sleep(2)

if __name__ == "__main__":
    test_pooler_retry()
