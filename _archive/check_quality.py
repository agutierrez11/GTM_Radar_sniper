import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../engine/.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def get_latest_captures(limit=10):
    url = f"{SUPABASE_URL}/rest/v1/empresas?status=eq.ENRIQUECIDO&order=last_scan.desc&limit={limit}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    try:
        r = requests.get(url, headers=headers)
        if r.status_code == 200:
            leads = r.json()
            print(f"--- LATEST {len(leads)} CAPTURES ---")
            for l in leads:
                print(f"Name: {l.get('name')}")
                print(f"Website: {l.get('website')}")
                # Use safe printing for potentially weird characters
                intel_sample = str(l.get('description', ''))[:150].encode('ascii', 'ignore').decode('ascii')
                print(f"Sample Intel: {intel_sample}...")
                print("-" * 30)
        else:
            print(f"Error: {r.status_code}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    get_latest_captures()
