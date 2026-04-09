import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

url = f"{SUPABASE_URL}/rest/v1/empresas?limit=1"
r = requests.get(url, headers=headers)
if r.status_code == 200:
    data = r.json()
    if data:
        print(json.dumps(data[0], indent=2))
    else:
        print("Empty table")
else:
    print(f"Error: {r.status_code} - {r.text}")
