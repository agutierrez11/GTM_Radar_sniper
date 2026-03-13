import os
import requests
import psycopg2
import urllib.parse
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def test_configurations():
    print("--- DIAGNÓSTICO DE CONEXIÓN FINAL ---")
    
    password = "Beshaa_Tovah"
    # URL encoded password
    encoded_password = urllib.parse.quote_plus(password)
    
    configs = [
        ("DIRECT (5432)", "aws-1-us-east-1.pooler.supabase.com", 5432),
        ("POOLER (6543)", "aws-1-us-east-1.pooler.supabase.com", 6543),
    ]
    
    user = "postgres.bwbatonvkfcjkfvhcwtc"
    dbname = "postgres"
    
    for name, host, port in configs:
        print(f"\nProbando {name}...")
        try:
            # Intentamos conexión manual sin URI para evitar errores de parsing
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                dbname=dbname,
                sslmode='require',
                connect_timeout=10
            )
            print(f"[SUCCESS] {name}: ¡CONECTADO EXITOSAMENTE!")
            conn.close()
            return # Si uno funciona, paramos
        except Exception as e:
            print(f"[FAIL] {name}: {e}")

if __name__ == "__main__":
    test_configurations()
