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

def rescue_junk_batch(limit=50):
    print(f"--- SNIPER JUNK RESCUE STARTING (Batch: {limit}) ---")
    
    # Fetch JUNK leads with scan_error GENERIC_DESCRIPTION_NOISE
    fetch_url = f"{url}/rest/v1/empresas?status=eq.JUNK&scan_error=eq.GENERIC_DESCRIPTION_NOISE&limit={limit}"
    r = requests.get(fetch_url, headers=headers)
    
    if r.status_code != 200:
        print(f"Error fetching junk: {r.text}")
        return

    junk_leads = r.json()
    print(f"Analyzing {len(junk_leads)} junk leads for hidden gold...")

    for l in junk_leads:
        desc = l.get('name', '') # In these cases, the phrase is in the 'name' field
        print(f"Analyzing Noise: {desc[:50]}...")
        
        # PROMPT LOGIC (Simulated for this pilot)
        # In production, we'd call an LLM to extract "Company Names" from this string.
        # Example: "Empresas en México que usan Incode" -> Entity: Incode
        
        entities_found = []
        if "Incode" in desc: entities_found.append("Incode")
        if "Nu México" in desc: entities_found.append("Nu México")
        
        if entities_found:
            print(f"RESCUED: Found entities {entities_found} in noise!")
            # 1. We could update the status to 'ENRIQUECIMIENTO_PENDIENTE'
            # 2. Or create a 'Market Signal' node.
            # For now, mark as RESCUED.
            patch_url = f"{url}/rest/v1/empresas?id=eq.{l['id']}"
            requests.patch(patch_url, headers=headers, json={
                "status": "RESCUED",
                "scan_error": f"RESCUED_ENTITIES: {', '.join(entities_found)}"
            })
        else:
            # Still junk, but we've audited it.
            patch_url = f"{url}/rest/v1/empresas?id=eq.{l['id']}"
            requests.patch(patch_url, headers=headers, json={"status": "JUNK_AUDITED"})

    print("--- JUNK RESCUE COMPLETE ---")

if __name__ == "__main__":
    rescue_junk_batch(20)
