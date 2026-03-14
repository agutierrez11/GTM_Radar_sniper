import os
import requests
from dotenv import load_dotenv
import json

load_dotenv('engine/.env')
url = f"{os.getenv('SUPABASE_URL')}/rest/v1/empresas?status=eq.NO_URL&select=id,name,website,description&limit=20"
headers = {
    'apikey': os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
    'Authorization': f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}"
}

r = requests.get(url, headers=headers)
if r.status_code == 200:
    leads = r.json()
    for l in leads:
        print(f"ID: {l['id']} | Name: {l['name']} | Web: {l['website']}")
else:
    print(f"Error: {r.status_code} - {r.text}")
