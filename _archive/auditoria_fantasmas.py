import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def audit_database():
    db_url = os.getenv("DATABASE_URL")
    print(f"Intentando conectar a: {db_url.split('@')[-1]}") # Log seguro sin pass
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # 1. Buscar "Fantasmas" (Rapyd)
        print("\n--- Investigando rastro de Rapyd.net ---")
        cur.execute("SELECT COUNT(*) FROM fintech_leads WHERE url ILIKE '%rapyd%' OR raw_scraped_text ILIKE '%rapyd%'")
        rapyd_count = cur.fetchone()[0]
        print(f"Leads con rastro de Rapyd: {rapyd_count}")
        
        # 2. Conteo de Inventario
        print("\n--- Auditoria de Inventario Real ---")
        cur.execute("SELECT COUNT(*) FROM fintech_leads")
        total = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM fintech_leads WHERE raw_scraped_text IS NOT NULL")
        completos = cur.fetchone()[0]
        
        print(f"Total en Tabla: {total}")
        print(f"Con Inteligencia (Saneados): {completos}")
        print(f"Huecos vacios (Pendientes): {total - completos}")
        
        # 3. Ver ultimas inserciones para ver actividad
        print("\n--- Actividad Reciente (Ultimas 5) ---")
        cur.execute("SELECT url, created_at FROM fintech_leads ORDER BY created_at DESC LIMIT 5")
        for row in cur.fetchall():
            print(f"- {row[0]} (Creado: {row[1]})")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error de conexion: {e}")

if __name__ == "__main__":
    audit_database()
