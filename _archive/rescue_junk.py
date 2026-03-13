import os
import requests
import json
import time
from dotenv import load_dotenv

load_dotenv('engine/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json'
}

def rescue_batch(limit=10):
    print(f"--- RESCUE JUNK AGENT STARTING (Batch: {limit}) ---")
    
    # Fetch leads marked as JUNK with long names
    fetch_url = f"{url}/rest/v1/empresas?status=eq.JUNK&limit={limit}&select=id,name"
    r = requests.get(fetch_url, headers=headers)
    if r.status_code != 200:
        print("Error fetching junk.")
        return
    
    leads = r.json()
    for l in leads:
        junk_name = l['name']
        lid = l['id']
        
        # LOGIC: If name is a description, extract the 'Entity' if possible
        # For now, we use a tactical 'Entity Extractor' prompt via my internal knowledge 
        # but in script we can use Serper to see if the name resolves to a real company
        
        print(f"Processing Junk: {junk_name[:50]}...")
        
        # TACTICAL: If the junk name contains a company name in quotes or at the start
        # Many of these look like "Company Name: Description..." or "Description of Company Name"
        
        # For the prototype, if we find " (..." or " - ", we try to split
        extracted_name = None
        if " - " in junk_name:
            extracted_name = junk_name.split(" - ")[0].strip()
        elif " (" in junk_name:
            extracted_name = junk_name.split(" (")[0].strip()
        elif ":" in junk_name:
            extracted_name = junk_name.split(":")[0].strip()
            
        if extracted_name and len(extracted_name) < 40:
            print(f"RESCUED Name: {extracted_name}")
            # Update and set to NO_URL to be picked up by the URL Auditor
            update_payload = {
                "name": extracted_name,
                "status": "NO_URL",
                "scan_error": "RESCUED_FROM_JUNK"
            }
            requests.patch(f"{url}/rest/v1/empresas?id=eq.{lid}", headers=headers, json=update_payload)
        else:
            print("Could not rescue via simple logic. Marking for AI Deep Research.")
            # For now, stay in JUNK but mark as checked
            requests.patch(f"{url}/rest/v1/empresas?id=eq.{lid}", headers=headers, json={"scan_error": "JUNK_ANALYZED_NO_RESCUE"})

if __name__ == "__main__":
    rescue_batch(20)
