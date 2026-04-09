import os
import requests
import json
import time
import logging
from dotenv import load_dotenv
from bs4 import BeautifulSoup

# Load environment
load_dotenv('engine/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
log = logging.getLogger("LATAM_AGENT")

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def scrape_directory_slugs():
    """Extracts all company slugs from the main directory."""
    url = "https://www.latamfintech.co/directorio"
    log.info(f"Scraping directory: {url}")
    
    # We use a simple request first, if blocked we might need the browser cookies
    try:
        r = requests.get(url, timeout=20)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Look for links that match the company pattern /companies/[slug]
        links = soup.find_all('a', href=True)
        slugs = []
        for l in links:
            href = l['href']
            if '/companies/' in href and href != '/companies/':
                slug = href.split('/companies/')[-1].strip('/')
                if slug not in slugs:
                    slugs.append(slug)
        
        log.info(f"Found {len(slugs)} slugs in directory.")
        return slugs
    except Exception as e:
        log.error(f"Error scraping directory: {e}")
        return []

def scrape_company_detail(slug):
    """Scrapes the premium details for a specific company."""
    url = f"https://www.latamfintech.co/companies/{slug}"
    log.info(f"Scraping detail: {url}")
    
    # NOTE: To get premium data (Timeline/Funding), we will eventually need 
    # the session cookies from the manual login. 
    # For now, we implement the structure.
    
    try:
        r = requests.get(url, timeout=20)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Extraction logic for Funding, Timeline, etc.
        # This will be refined once we have the HTML structure of a logged-in page
        name = soup.find('h1').text.strip() if soup.find('h1') else slug
        
        data = {
            "name": name,
            "website_url": f"https://www.latamfintech.co/companies/{slug}", # Using this as unique key if needed
            "status": "PREMIUM_PENDING",
            "intel": json.dumps({"slug": slug, "source": "Latam Fintech Hub"})
        }
        return data
    except Exception as e:
        log.error(f"Error scraping {slug}: {e}")
        return None

def save_to_supabase(data):
    if not data: return
    
    # Check if exists or upsert
    url = f"{SUPABASE_URL}/rest/v1/empresas"
    # Note: We need to match the columns in the actual DB
    # Based on previous errors, we'll try to insert name and status first
    payload = {
        "name": data["name"],
        "status": data["status"],
        "description": data["intel"]
    }
    r = requests.post(url, headers=get_headers(), json=payload)
    if r.status_code in [200, 201]:
        log.info(f"Saved {data['name']} to Supabase.")
    else:
        log.warning(f"Failed to save {data['name']}: {r.text}")

def run_agent():
    slugs = scrape_directory_slugs()
    for s in slugs[:10]: # Pilot of 10
        item = scrape_company_detail(s)
        save_to_supabase(item)
        time.sleep(1)

if __name__ == "__main__":
    run_agent()
