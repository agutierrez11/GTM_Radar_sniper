import os
import requests
import json
from dotenv import load_dotenv

load_dotenv('engine/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

def clean_noise_leads():
    print("--- SNIPER NOISE PURGE STARTING ---")
    
    # 1. Purge leads with names that look like generic phrases or are too long
    # (e.g., "Instituciones financieras que buscan...")
    query = "select=id,name&name=like.*que buscan*"
    r = requests.get(f"{SUPABASE_URL}/rest/v1/empresas?{query}", headers=headers)
    
    if r.status_code == 200:
        noise = r.json()
        print(f"Found {len(noise)} leads with 'que buscan' phrase. Marking as JUNK.")
        for l in noise:
            patch_url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{l['id']}"
            requests.patch(patch_url, headers=headers, json={"status": "JUNK", "scan_error": "GENERIC_DESCRIPTION_NOISE"})
            
    # 2. Purge very short or very long names
    # (Simplified for pilot)
    print("--- PURGE PILOT COMPLETE ---")

if __name__ == "__main__":
    clean_noise_leads()
