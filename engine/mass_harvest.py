import requests
import re
import os
from dotenv import load_dotenv

load_dotenv()

# Config
FILE_PATH = "sources_regional_fintech.md"
WEBHOOK_URL = "https://bwbatonvkfcjkfvhcwtc.supabase.co/functions/v1/omni-ingest"

def harvest_sources():
    if not os.path.exists(FILE_PATH):
        print(f"Error: {FILE_PATH} not found")
        return

    with open(FILE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all markdown links with their titles [Title](URL)
    matches = re.findall(r'\[(.*?)\]\((https?://.*?)\)', content)
    
    print(f"🚀 Found {len(matches)} strategic sources. Starting ingestion...")

    for title, url in matches:
        payload = {
            "url": url,
            "source": f"Asociación_{title.replace(' ', '_')}",
            "source_url": url
        }
        
        try:
            response = requests.post(WEBHOOK_URL, json=payload)
            if response.status_code == 200:
                print(f"✅ Ingested [{title}]: {url}")
            else:
                print(f"❌ Failed {url}: {response.text}")
        except Exception as e:
            print(f"⚠️ Error sending {url}: {e}")

if __name__ == "__main__":
    harvest_sources()
