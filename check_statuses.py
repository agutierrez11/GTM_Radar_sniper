import os
import requests
from dotenv import load_dotenv
from collections import Counter

load_dotenv('engine/.env')
url = f"{os.getenv('SUPABASE_URL')}/rest/v1/empresas?select=status"
headers = {
    'apikey': os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
    'Authorization': f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}"
}

def find_all_statuses():
    print(f"\n--- Finding all unique statuses in empresas ---")
    status_counts = Counter()
    offset = 0
    limit = 1000
    while True:
        url = f"{os.getenv('SUPABASE_URL')}/rest/v1/empresas?select=status&limit={limit}&offset={offset}"
        r = requests.get(url, headers=headers)
        if r.status_code == 200:
            batch = [x['status'] for x in r.json()]
            if not batch: break
            status_counts.update(batch)
            offset += limit
            if offset > 30000: break # Safety
        else:
            print(f"Error at offset {offset}: {r.status_code}")
            break
    print(f"Status counts: {dict(status_counts)}")

find_all_statuses()
