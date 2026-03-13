import os
import psycopg2
import time
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def wait_for_db():
    print("--- ESPERANDO A QUE SUPABASE DESCONGELE EL CIRCUIT BREAKER ---")
    
    password = "Beshaa_Tovah"
    user = "postgres.bwbatonvkfcjkfvhcwtc" 
    dbname = "postgres"
    host = "aws-1-us-east-1.pooler.supabase.com" 
    
    # Probamos ambos puertos, el 5432 es el que sale en su screenshot ahora
    ports = [5432, 6543]
    
    max_retries = 10
    for i in range(max_retries):
        for port in ports:
            try:
                print(f"Intento {i+1}/{max_retries} en Puerto {port}...")
                conn = psycopg2.connect(
                    host=host,
                    port=port,
                    user=user,
                    password=password,
                    dbname=dbname,
                    sslmode='require',
                    connect_timeout=10
                )
                print(f"\n[SUCCESS] ¡CONECTADO AL PUERTO {port}!")
                print("El Circuit Breaker se ha cerrado. Procediendo.")
                conn.close()
                return True
            except Exception as e:
                error_msg = str(e)
                if "Circuit breaker open" in error_msg:
                    print(f"[RETRY] El servidor sigue reiniciando su conexión interna (Circuit Breaker sigue abierto).")
                else:
                    print(f"[ERROR] {error_msg}")
        
        print(f"Esperando 20 segundos para el siguiente intento...\n")
        time.sleep(20)
    
    return False

if __name__ == "__main__":
    if wait_for_db():
        print("SISTEMA LISTO.")
    else:
        print("SISTEMA SIGUE BLOQUEADO. NECESITAMOS REVISAR EL DASHBOARD.")
