import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def audit_supabase_data():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }
    
    table = "fintech_leads"
    
    print(f"--- AUDITANDO DATOS EN {table} ---")
    
    # Tomamos una muestra de 50 registros, algunos con contenido y otros sin él
    try:
        # 25 con contenido (para ver qué tipo de info se extrajo)
        r_full = requests.get(f"{url}/rest/v1/{table}?raw_scraped_text=not.is.null&select=company_name,website_url,raw_scraped_text&limit=25", headers=headers)
        # 25 sin contenido (para ver qué falta procesar)
        r_empty = requests.get(f"{url}/rest/v1/{table}?raw_scraped_text=is.null&select=company_name,website_url&limit=25", headers=headers)
        
        if r_full.status_code == 200:
            full_data = r_full.json()
            print(f"\n[SIGNAL CHECK] Muestra de leads procesados ({len(full_data)}):")
            for i, item in enumerate(full_data):
                content_snippet = (item.get("raw_scraped_text") or "")[:200].replace("\n", " ")
                print(f"{i+1}. {item.get('company_name')} | {item.get('website_url')}")
                print(f"   Snippet: {content_snippet}...")
        
        if r_empty.status_code == 200:
            empty_data = r_empty.json()
            print(f"\n[CASCARÓN CHECK] Muestra de leads pendientes ({len(empty_data)}):")
            for i, item in enumerate(empty_data):
                print(f"{i+1}. {item.get('company_name')} | {item.get('website_url')}")
                
    except Exception as e:
        print(f"[ERROR] {e}")

if __name__ == "__main__":
    audit_supabase_data()
