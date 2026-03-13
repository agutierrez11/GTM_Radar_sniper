import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def audit_full_inventory():
    db_url = os.getenv("DATABASE_URL")
    print(f"Buscando en: {db_url.split('@')[-1]}")
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        tables = ['empresas', 'fintech_leads', 'relaciones', 'health_audit', 'market_gaps']
        print("\n--- INVENTARIO REAL POR TABLA ---")
        for table in tables:
            try:
                cur.execute(f"SELECT COUNT(*) FROM {table}")
                count = cur.fetchone()[0]
                print(f"Table {table}: {count} filas")
            except:
                print(f"Table {table}: No accesible")
                conn.rollback()

        print("\n--- BUSCANDO FANTASMAS (RAPYD) ---")
        # Buscamos Rapyd en las dos tablas principales
        cur.execute("SELECT COUNT(*) FROM fintech_leads WHERE url ILIKE '%rapyd%'")
        in_leads = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM empresas WHERE website ILIKE '%rapyd%' OR nombre ILIKE '%rapyd%'")
        in_empresas = cur.fetchone()[0]
        print(f"Rapyd en fintech_leads: {in_leads}")
        print(f"Rapyd en empresas: {in_empresas}")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error de conexion: {e}")

if __name__ == "__main__":
    audit_full_inventory()
