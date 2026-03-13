import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def find_ghosts():
    db_url = os.getenv("DATABASE_URL")
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        print("--- Investigando Fantasmas (Rapyd) ---")
        cur.execute("SELECT COUNT(*) FROM fintech_leads WHERE url ILIKE '%rapyd.net%' OR raw_scraped_text ILIKE '%rapyd%'")
        rapyd_count = cur.fetchone()[0]
        print(f"Registros relacionados con Rapyd: {rapyd_count}")
        
        print("\n--- Auditoria de Inventario ---")
        cur.execute("SELECT COUNT(*) FROM fintech_leads")
        total = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM fintech_leads WHERE raw_scraped_text IS NOT NULL")
        completos = cur.fetchone()[0]
        
        print(f"Total en DB: {total}")
        print(f"Completos: {completos}")
        print(f"Pendientes: {total - completos}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_ghosts()
