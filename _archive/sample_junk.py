import os
import requests
from dotenv import load_dotenv

load_dotenv('engine/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
}

def get_junk_samples(limit=10):
    print(f"--- JUNK SAMPLES FOR REVERSE ENGINEERING ---")
    # Fetch leads marked as JUNK or with the tactical scan_error I used
    target_url = f"{url}/rest/v1/empresas?status=eq.JUNK&limit={limit}&select=id,name,description,scan_error"
    r = requests.get(target_url, headers=headers)
    if r.status_code == 200:
        leads = r.json()
        for l in leads:
            print(f"ID: {l['id']}")
            print(f"Name: {l['name']}")
            desc = l.get('description') or "N/A"
            print(f"Description: {desc[:100]}...")
            print(f"Error: {l.get('scan_error')}")
            print("-" * 20)
    else:
        print(f"Error fetching: {r.status_code}")

if __name__ == "__main__":
    get_junk_samples(10)
