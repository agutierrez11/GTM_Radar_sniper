import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

# Load credentials
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def ingest_nugget(name, description, category="INTELLIGENCE"):
    url = f"{SUPABASE_URL}/rest/v1/empresas"
    payload = {
        "name": name,
        "description": description,
        "website": "flagshipadvisorypartners.com",
        "status": "PREMIUM_PILOT", # Special status for the demo
        "sector": category,         # Storing string category in 'sector'
        "infra_potential": True,   # Setting boolean flag
        "last_scan": datetime.utcnow().isoformat()
    }
    
    try:
        r = requests.post(url, headers=get_headers(), json=payload, timeout=20)
        if r.status_code in [200, 201, 204]:
            print(f"✅ Ingested: {name}")
        else:
            print(f"❌ Failed: {name} ({r.status_code}) - {r.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

nuggets = [
    {
        "name": "Capital One / Brex Pivot",
        "description": "$5.15B acquisition signals the ultimate Bank-Fintech convergence for corporate spend control (Jan 2026).",
        "category": "M&A_STRATEGIC"
    },
    {
        "name": "Payments M&A Surge",
        "description": "Global fintech M&A volume rose 20% in Q2 2024, doubling the growth rate of previous years.",
        "category": "MARKET_SHIFT"
    },
    {
        "name": "PIX Global Blueprint",
        "description": "Brazil's PIX driving ~$200B/mo, serving as the worldwide benchmark for A2A payment schemes.",
        "category": "INFRA_DISRUPTION"
    },
    {
        "name": "Regulated Interoperability (Peru)",
        "description": "Yape/PLIN forced connectivity signals a LATAM trend of regulatory-mandated interoperability.",
        "category": "REGULATORY"
    },
    {
        "name": "AI Defense Moat",
        "description": "B2B SaaS platforms are integrating proprietary AI to defend against generic LLM commoditization.",
        "category": "TECH_MOAT"
    },
    {
        "name": "391% Speed-to-Lead Boost",
        "description": "Responding within 1 minute vs. 30 minutes increases conversion by 391%. NERV core pillar.",
        "category": "SPEED_TO_LEAD"
    }
]

if __name__ == "__main__":
    print("🚀 Starting Flagship Intelligence Ingestion...")
    for n in nuggets:
        ingest_nugget(n["name"], n["description"], n["category"])
    print("🎯 Ingestion Complete.")
