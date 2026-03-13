import os
import requests
import json
import time
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../engine/.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SERPER_KEY = os.getenv("SERPER_API_KEY_VM")

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def fetch_no_url_leads(limit=10):
    url = f"{SUPABASE_URL}/rest/v1/empresas?status=eq.NO_URL&website=is.null&limit={limit}"
    r = requests.get(url, headers=get_headers())
    return r.json() if r.status_code == 200 else []

def find_official_url(name):
    if not SERPER_KEY:
        print("Error: Missing Serper Key")
        return None
    
    print(f"Searching Serper for: {name}...")
    s_url = "https://google.serper.dev/search"
    s_headers = {'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json'}
    s_payload = json.dumps({"q": f"{name} official website fintech"})
    
    try:
        r = requests.post(s_url, headers=s_headers, data=s_payload, timeout=20)
        if r.status_code == 200:
            results = r.json().get("organic", [])
            for res in results:
                link = res.get("link", "")
                # Skip common social/junk domains to find actual sites
                blacklist = ["linkedin.com", "facebook.com", "twitter.com", "instagram.com", "youtube.com", "crunchbase.com", "pitchbook.com"]
                if not any(b in link for b in blacklist):
                    return link
        return None
    except Exception as e:
        print(f"Serper Error: {e}")
        return None

def update_lead(lead_id, website):
    url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{lead_id}"
    payload = {
        "website": website,
        "status": "CASCARON_PENDIENTE", # Re-inject into main engine
        "scan_error": "URL_REDISCOVERED"
    }
    r = requests.patch(url, headers=get_headers(), json=payload)
    return r.status_code in [200, 204]

def execute_pilot(batch_size=10):
    print(f"--- URL DISCOVERY PILOT ({batch_size} leads) ---")
    leads = fetch_no_url_leads(batch_size)
    if not leads:
        print("No leads found with status NO_URL.")
        return

    success_count = 0
    for l in leads:
        name = l.get('name')
        lid = l.get('id')
        official_url = find_official_url(name)
        
        if official_url:
            print(f"FOUND: {name} -> {official_url}")
            if update_lead(lid, official_url):
                success_count += 1
        else:
            print(f"NOT FOUND: {name}")
        
        time.sleep(1) # Small delay for Serper

    print(f"\n--- PILOT FINISHED: {success_count}/{len(leads)} updated ---")

if __name__ == "__main__":
    execute_pilot(20) # Running a batch of 20 for the user
