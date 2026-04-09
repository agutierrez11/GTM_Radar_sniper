import os
import requests
import json
import re
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

def clean_name(name):
    # If it's a URL, extract domain/name
    if not name:
        return "UNKNOWN"
        
    if name.lower().startswith(('http://', 'https://', 'www.')):
        parsed = urlparse(name if '://' in name else 'https://' + name)
        domain = parsed.netloc or parsed.path.split('/')[0]
        # Remove www. and common TLDs
        clean = re.sub(r'^www\.', '', domain)
        clean = re.sub(r'\.(com|mx|org|net|co|io|uno|ai|app|dev|me|biz)(\.mx)?$', '', clean, flags=re.IGNORECASE)
        # Handle cases like y.uno -> YUNO
        if clean == 'y':
            return "YUNO"
        return clean.upper()
    
    # Remove phrases like "Instituciones financieras que buscan..."
    # If name is too long and contains common "noise" words
    noise_patterns = [
        r"que buscan.*",
        r"empresa de.*",
        r"plataforma para.*",
        r"solución de.*"
    ]
    
    for pattern in noise_patterns:
        name = re.sub(pattern, "", name, flags=re.IGNORECASE).strip()
    
    if len(name) > 40 and ' ' in name:
        # If it's still too long, take the first two words if they look like a brand
        words = name.split()
        if len(words) > 0:
            return words[0].upper()
            
    return name.upper()

def normalize_database():
    print("--- SNIPER BRAND NORMALIZATION STARTING ---")
    
    # Fetch records that need cleaning
    query = "select=id,nombre,website_url&limit=1000"
    url = f"{SUPABASE_URL}/rest/v1/empresas?{query}"
    
    try:
        r = requests.get(url, headers=headers)
        if r.status_code != 200:
            print(f"Error fetching: {r.status_code} - {r.text}")
            return
            
        leads = r.json()
        print(f"Analyzing {len(leads)} leads...")
        updated_count = 0
        
        for l in leads:
            orig_name = l.get('nombre', '')
            new_name = clean_name(orig_name)
            
            # Additional check: if names are equal but casing shifted, or totally different
            if new_name and new_name != orig_name:
                print(f"NORMALIZED: |{orig_name}| -> |{new_name}|")
                patch_url = f"{SUPABASE_URL}/rest/v1/empresas?id=eq.{l['id']}"
                res = requests.patch(patch_url, headers=headers, json={"nombre": new_name})
                if res.status_code in [200, 204]:
                    updated_count += 1
                else:
                    print(f"Failed to update {l['id']}: {res.status_code}")
        
        print(f"Normalization complete. Updated {updated_count} records.")
        
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    normalize_database()
