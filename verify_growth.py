import os
import requests
from dotenv import load_dotenv
import time

load_dotenv('engine/.env')
headers = {
    'apikey': os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
    'Authorization': f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}",
    'Range': '0-0', 
    'Prefer': 'count=exact'
}
url_enriched = f"{os.getenv('SUPABASE_URL')}/rest/v1/empresas?status=eq.ENRIQUECIDO&select=count"

def get_count():
    r = requests.get(url_enriched, headers=headers)
    return int(r.headers.get('Content-Range', '0/0').split('/')[-1])

c1 = get_count()
print(f"Count 1: {c1}")
time.sleep(10) # Wait a bit to see if scraper moved
c2 = get_count()
print(f"Count 2: {c2}")

if c2 > c1:
    print(f"PROGRESS DETECTED: +{c2 - c1} leads enriched.")
else:
    print("NO PROGRESS DETECTED in last 10 seconds.")
