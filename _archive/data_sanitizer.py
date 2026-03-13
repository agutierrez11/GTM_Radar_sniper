import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../engine/.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

ERROR_KEYWORDS = [
    "Connection lost",
    "Upstream proxy refused connection",
    "403 Forbidden",
    "Cloudflare",
    "Access Denied",
    "Robot Detection",
    "Enable JavaScript",
    "Verify you are a human"
]

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def sanitize_database():
    print("--- DATA SANITIZER STARTING ---")
    
    # 1. RETROACTIVE JUNK NAME FILTER
    print("Finding junk names (>60 chars)...")
    fetch_url = f"{SUPABASE_URL}/rest/v1/empresas?status=neq.JUNK&select=id,name"
    r = requests.get(fetch_url, headers=get_headers())
    if r.status_code == 200:
        leads = r.json()
        junk_ids = [l['id'] for l in leads if len(l.get('name', '')) > 60]
        if junk_ids:
            print(f"Marking {len(junk_ids)} leads as JUNK due to long names.")
            for chunk in [junk_ids[i:i + 50] for i in range(0, len(junk_ids), 50)]:
                patch_url = f"{SUPABASE_URL}/rest/v1/empresas?id=in.({','.join(map(str, chunk))})"
                requests.patch(patch_url, headers=get_headers(), json={"status": "JUNK", "scan_error": "NAME_TOO_LONG_RETRO"})
    
    # 2. CONTENT QUALITY FILTER (Error messages in description)
    print("Checking for error messages in captures...")
    fetch_url = f"{SUPABASE_URL}/rest/v1/empresas?status=eq.ENRIQUECIDO&select=id,name,description"
    r = requests.get(fetch_url, headers=get_headers())
    if r.status_code == 200:
        leads = r.json()
        to_reset = []
        for l in leads:
            desc = l.get('description', '')
            if not desc: continue
            for kw in ERROR_KEYWORDS:
                if kw.lower() in desc.lower():
                    to_reset.append(l['id'])
                    print(f"Found error '{kw}' in lead: {l['name']}")
                    break
        
        if to_reset:
            print(f"Resetting {len(to_reset)} leads with bad content to PENDIENTE.")
            for chunk in [to_reset[i:i + 50] for i in range(0, len(to_reset), 50)]:
                patch_url = f"{SUPABASE_URL}/rest/v1/empresas?id=in.({','.join(map(str, chunk))})"
                requests.patch(patch_url, headers=get_headers(), json={"status": "PENDIENTE", "description": None, "scan_error": "SANUR_CLEANUP"})

if __name__ == "__main__":
    sanitize_database()
