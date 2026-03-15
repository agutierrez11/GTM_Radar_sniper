import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'engine', '.env'))

GIANTS = [
    "EBANX", "Cobre", "Wiseasy", "Cognizant", "PayRetailers", "SWIFT", 
    "Signifyd", "PagoNxt", "Nuvei", "Worldpay", "Backbase", "PPRO", 
    "MIT", "Mitec", "Cobis Topaz", "Unlimit", "Mastercard", "Nous Latam", 
    "Rapyd", "TeemoPay"
]

def activate_giants():
    url = f"{os.getenv('SUPABASE_URL')}/rest/v1/empresas"
    headers = {
        "apikey": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "Authorization": f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}",
        "Content-Type": "application/json"
    }
    
    for g in GIANTS:
        # Update matching records to GOLD to trigger refinery
        params = {"name": f"ilike.*{g}*"}
        payload = {"status": "GOLD"}
        r = requests.patch(url, headers=headers, params=params, json=payload)
        if r.status_code in [200, 204]:
            print(f"✅ Activated: {g}")
        else:
            print(f"❌ Failed to activate {g}: {r.status_code}")

if __name__ == "__main__":
    activate_giants()
