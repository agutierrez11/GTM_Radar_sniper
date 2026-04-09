import os
import requests
import json
import csv
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'engine', '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def fetch_exclusive_diamonds(limit=20):
    url = f"{SUPABASE_URL}/rest/v1/empresas"
    # Focus on the Giants we just activated (status GOLD or ENRIQUECIDO)
    params = {
        "status": "in.(ENRIQUECIDO,GOLD)",
        "limit": limit,
        "order": "status.desc"
    }
    r = requests.get(url, headers=get_headers(), params=params)
    return r.json() if r.status_code == 200 else []

def export_for_v2(data, filename="fullenrich_v2_pilot.csv"):
    keys = ["name", "domain", "country", "vertical", "target_persona", "strategic_pain"]
    
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        
        for item in data:
            desc_raw = item.get("description", "")
            try:
                strat = json.loads(desc_raw)
                pain = strat.get("pain_point", "N/A")
                persona = "Head of GTM / VP Sales" if "Payment" in str(item) else "CTO / Head of Product"
            except:
                pain = desc_raw
                persona = "Decision Maker"

            writer.writerow({
                "name": item.get("name"),
                "domain": item.get("url", ""),
                "country": item.get("country", "Latam"),
                "vertical": "Strategic Giant (Tier 1)",
                "target_persona": persona,
                "strategic_pain": pain
            })
    print(f"✅ V2 Pilot Export Ready: {filename}")

if __name__ == "__main__":
    leads = fetch_exclusive_diamonds(20)
    if leads:
        export_for_v2(leads)
    else:
        print("No strategic giants found in Diamond/Gold status.")
