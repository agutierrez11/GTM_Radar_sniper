import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'engine', '.env'))

def search_and_enrich_person(company_domain, title_keywords=["GTM", "Sales", "Fintech"]):
    api_key = os.getenv("FULLENRICH_API_KEY")
    # V2 Search Endpoint
    search_url = "https://api.fullenrich.com/v2/person/search"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Payload to find decision makers
    payload = {
        "domain": company_domain,
        "titles": title_keywords,
        "limit": 3
    }
    
    print(f"🔍 Searching for Decision Makers at {company_domain} ({title_keywords})...")
    # For now, we simulate to protect your 1000 credits
    # In a real run, this would return a list of persons with IDs for subsequent enrichment
    return {
        "status": "success",
        "message": "V2 Search Simulation Complete",
        "results": [
            {"name": "Decision Maker at " + company_domain, "title": "Head of GTM", "id": "p_12345"}
        ]
    }

if __name__ == "__main__":
    print(f"--- FULLENRICH V2 PERSON SEARCH ---")
    # Testing with a key Giant
    res = search_and_enrich_person("ebanx.com", ["GTM", "Head of Sales"])
    print(json.dumps(res, indent=2))
