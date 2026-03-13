import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../engine/.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def export_failures():
    # We look for leads that are still PENDIENTE or have a non-empty scan_error
    # Actually, let's just fetch everything that is NOT enriched.
    url = f"{SUPABASE_URL}/rest/v1/empresas?status=neq.ENRIQUECIDO&select=name,website,scan_error&limit=1000"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    try:
        r = requests.get(url, headers=headers)
        if r.status_code == 200:
            leads = r.json()
            # Filter out junk names (too long)
            filtered_leads = [l for l in leads if len(l.get('name', '')) <= 60]
            
            print(f"--- REPORTE DE FALLOS (Filtrado: {len(filtered_leads)} de {len(leads)}) ---")
            for l in filtered_leads:
                print(f"Target: {l.get('name')} | URL: {l.get('website')} | Error: {l.get('scan_error')}")
            
            with open("failed_targets.txt", "w", encoding="utf-8") as f:
                for l in filtered_leads:
                    f.write(f"{l.get('name')} - {l.get('website')}\n")
            print("\n[OK] Lista exportada a 'failed_targets.txt' (Junk filtrado)")
        else:
            print(f"Error fetching data: {r.status_code}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    export_failures()
