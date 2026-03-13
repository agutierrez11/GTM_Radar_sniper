import os
import requests
import sys
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../engine/.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def inspect_lead(name):
    url = f"{SUPABASE_URL}/rest/v1/empresas?name=ilike.*{name}*&select=*"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    try:
        r = requests.get(url, headers=headers)
        if r.status_code == 200:
            leads = r.json()
            if not leads:
                print(f"No lead found with name like '{name}'")
                return
            for l in leads:
                print(f"--- LEAD: {l.get('name')} ---")
                print(f"ID: {l.get('id')}")
                print(f"Website: {l.get('website')}")
                print(f"Status: {l.get('status')}")
                print(f"Last Scan: {l.get('last_scan')}")
                print(f"Error: {l.get('scan_error')}")
                print(f"Description (first 200 chars): {str(l.get('description'))[:200]}...")
                print("-" * 30)
        else:
            print(f"Error: {r.status_code}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    name_to_search = sys.argv[1] if len(sys.argv) > 1 else ""
    if name_to_search:
        inspect_lead(name_to_search)
    else:
        print("Please provide a lead name to search.")
