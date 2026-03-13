import os
import psycopg2
from dotenv import load_dotenv
import time

load_dotenv()

def try_connect(uri):
    try:
        conn = psycopg2.connect(uri)
        return conn
    except Exception as e:
        print(f"Fallo conexion con: {uri.split('@')[-1]} - Error: {e}")
        return None

def audit_full_inventory():
    db_url = os.getenv("DATABASE_URL")
    
    # Intentamos diferentes formatos de usuario si el principal falla
    conn = try_connect(db_url)
    
    if not conn:
        print("Intentando formato alternativo (Direct Connection)...")
        # El usuario menciona que db.bwbatonvkfcjkfvhcwtc.supabase.co fallaba, pero probemos el URI directo de la captura:
        # postgresql://postgres:[YOUR-PASSWORD]@db.bwbatonvkfcjkfvhcwtc.supabase.co:5432/postgres
        direct_url = "postgresql://postgres:Sansonconpelolargoesmuyfuerte@db.bwbatonvkfcjkfvhcwtc.supabase.co:5432/postgres"
        conn = try_connect(direct_url)

    if not conn:
        print("ABORTANDO: No se pudo conectar con Pooler ni Directo. Verifica la password o si el Pooler esta activo.")
        return

    try:
        cur = conn.cursor()
        
        tables = ['empresas', 'fintech_leads', 'relaciones', 'health_audit', 'market_gaps']
        print("\n--- INVENTARIO REAL POR TABLA ---")
        for table in tables:
            try:
                cur.execute(f"SELECT COUNT(*) FROM {table}")
                count = cur.fetchone()[0]
                print(f"Table {table}: {count} filas")
            except Exception as e:
                print(f"Table {table}: No accesible ({e})")
                conn.rollback()

        print("\n--- BUSCANDO FANTASMAS (RAPYD) ---")
        # Buscamos Rapyd en las tablas
        for table in ['empresas', 'relaciones', 'fintech_leads']:
            try:
                # Buscamos en cualquier columna de texto si existe
                cur.execute(f"SELECT COUNT(*) FROM {table} WHERE CAST({table} AS TEXT) ILIKE '%rapyd%'")
                count = cur.fetchone()[0]
                print(f"Rapyd en {table}: {count}")
            except:
                conn.rollback()

        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error durante la auditoria: {e}")

if __name__ == "__main__":
    audit_full_inventory()
