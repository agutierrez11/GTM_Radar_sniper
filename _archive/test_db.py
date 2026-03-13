import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")

print(f"Testing connection to: {db_url.split('@')[1] if '@' in db_url else 'Invalid URL'}")

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'fintech_leads'")
    columns = [row[0] for row in cur.fetchall()]
    print(f"✅ Connection Successful!")
    print(f"Columns in 'fintech_leads': {columns}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"❌ Connection Failed: {e}")
