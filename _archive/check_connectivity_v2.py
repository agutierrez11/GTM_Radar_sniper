import os
import requests
import psycopg2
import socket
import time
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def test_dns_and_ping():
    print("--- 1. DNS & NETWORK RESOLUTION ---")
    host = "aws-1-us-east-1.pooler.supabase.com"
    try:
        ip = socket.gethostbyname(host)
        print(f"[OK] Host {host} resuelve a IP: {ip}")
    except Exception as e:
        print(f"[FAIL] Error resolviendo DNS: {e}")

    try:
        # Intento de socket a crudo
        for port in [5432, 6543]:
            start = time.time()
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(5)
            result = s.connect_ex((host, port))
            end = time.time()
            if result == 0:
                print(f"[OK] Puerto {port} ABIERTO (Socket respondió en {end-start:.2f}s)")
            else:
                print(f"[FAIL] Puerto {port} CERRADO (Código error: {result})")
            s.close()
    except Exception as e:
        print(f"[FAIL] Error en socket test: {e}")

def test_db_connection_params():
    print("\n--- 2. DB CONNECTION TEST (CON PARAMS) ---")
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("[FAIL] No DATABASE_URL")
        return
    
    # Probamos con sslmode=disable solo para ver si es el SSL el que traba el timeout
    # (Supabase requiere SSL, pero a veces el timeout ocurre ANTES de negociar SSL)
    print("Intentando conectar con connect_timeout=10...")
    try:
        conn = psycopg2.connect(db_url, connect_timeout=10)
        print("[SUCCESS] ¡CONECTADO!")
        conn.close()
    except Exception as e:
        print(f"[FAIL] Error de conexión DB: {e}")

if __name__ == "__main__":
    test_dns_and_ping()
    test_db_connection_params()
