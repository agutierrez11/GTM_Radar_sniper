import os
import requests
from dotenv import load_dotenv

load_dotenv('engine/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json'
}

def clear_empty_urls():
    print("--- PURGING EMPTY URLS FROM PENDING ---")
    
    # Fetch batch of pending leads without URLs
    while True:
        fetch_url = f"{url}/rest/v1/empresas?status=eq.CASCARON_PENDIENTE&website=is.null&select=id&limit=1000"
        r = requests.get(fetch_url, headers=headers)
        if r.status_code == 200:
            leads = r.json()
            if not leads:
                print("All empty URLs cleared!")
                break
            
            ids = [l['id'] for l in leads]
            print(f"Clearing batch of {len(ids)} IDs...")
            
            # Update batch to NO_URL
            for chunk in [ids[i:i + 100] for i in range(0, len(ids), 100)]:
                patch_url = f"{url}/rest/v1/empresas?id=in.({','.join(map(str, chunk))})"
                requests.patch(patch_url, headers=headers, json={"status": "NO_URL", "scan_error": "BULK_CLEANUP_NO_URL"})
        else:
            print(f"Error: {r.status_code}")
            break

if __name__ == "__main__":
    clear_empty_urls()
