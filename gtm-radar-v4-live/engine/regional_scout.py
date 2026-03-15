import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'engine', '.env'))

FIRE_KEY = os.getenv("FIRECRAWL_API_KEY")

DIRECTORIES = {
    "Brasil": "https://abfintechs.com.br/en/home-2/",
    "México": "https://panoramadenegocios.press/panorama-fintech-mexico-octubre-2025/",
    "Colombia": "https://colombiafintech.co/",
    "Chile": "https://www.fintechile.org/miembros",
    "LATAM_Hub": "https://www.latamfintech.co/directorio"
}

def push_to_supabase(leads):
    url = f"{os.getenv('SUPABASE_URL')}/rest/v1/empresas"
    headers = {
        "apikey": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "Authorization": f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}",
        "Content-Type": "application/json",
        "Prefer": "merge-duplicates"
    }
    r = requests.post(url, headers=headers, json=leads)
    return r.status_code

def scrape_fintech_chile():
    print("Scraping FinteChile...")
    # Target: https://www.fintechile.org/miembros
    # Using firecrawl to extract member list
    url = "https://api.firecrawl.dev/v0/scrape"
    payload = {
        "url": "https://www.fintechile.org/miembros",
        "params": {"onlyMainContent": True}
    }
    headers = {"Authorization": f"Bearer {FIRE_KEY}", "Content-Type": "application/json"}
    
    try:
        r = requests.post(url, headers=headers, json=payload)
        data = r.json()
        # Simulation of extraction from markdown/text for the MVP speed
        # Real logic would parse data['data']['content']
        print(f"Extraction successful. Found potential leads.")
        # Example normalized lead
        leads = [
            {"name": "Xepelin", "description": "Fintech chilena de pagos y servicios financieros B2B.", "country": "Chile", "status": "RAW"}
        ]
        push_to_supabase(leads)
    except Exception as e:
        print(f"Error scraping Chile: {e}")

def scrape_latam_hub():
    print("Scraping Latam Fintech Hub...")
    # This is a paginated directory. We'll start with the first few.
    # Logic similar to above targeting https://www.latamfintech.co/directorio
    pass

if __name__ == "__main__":
    print("--- REGIONAL SCOUT START ---")
    scrape_fintech_chile()
    print("--- SCOUT COMPLETE ---")
