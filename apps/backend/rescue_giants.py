import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'engine', '.env'))

GIANTS = [
    {"name": "EBANX", "country": "Brasil", "vertical": "Payments/Wallets"},
    {"name": "Cobre", "country": "Colombia", "vertical": "Payments/Wallets"},
    {"name": "Wiseasy", "country": "Global", "vertical": "Payments/Wallets"},
    {"name": "Cognizant", "country": "Global", "vertical": "Fintech Services"},
    {"name": "PayRetailers", "country": "Global", "vertical": "Payments/Wallets"},
    {"name": "SWIFT", "country": "Global", "vertical": "Payments/Infrastructure"},
    {"name": "Signifyd", "country": "Global", "vertical": "Fraud/Payments"},
    {"name": "PagoNxt (Santander)", "country": "Global", "vertical": "Payments/Banking"},
    {"name": "Nuvei", "country": "Canada", "vertical": "Payments/Wallets"},
    {"name": "Worldpay", "country": "Global", "vertical": "Payments/Wallets"},
    {"name": "Backbase", "country": "Global", "vertical": "Engagement Banking"},
    {"name": "PPRO", "country": "Global", "vertical": "Payments/Infrastructure"},
    {"name": "MIT (Mitec)", "country": "Mexico", "vertical": "Payments/Wallets"},
    {"name": "Cobis Topaz", "country": "Global", "vertical": "Banking Technology"},
    {"name": "Unlimit", "country": "Global", "vertical": "Payments/Wallets"},
    {"name": "Mastercard", "country": "Global", "vertical": "Payments/Wallets"},
    {"name": "Nous Latam", "country": "Argentina", "vertical": "Payments/Wallets"},
    {"name": "Rapyd", "country": "Global", "vertical": "Fintech-as-a-Service"},
    {"name": "TeemoPay", "country": "Global", "vertical": "Payments/Wallets"}
]

def force_inject_giants():
    url = f"{os.getenv('SUPABASE_URL')}/rest/v1/empresas"
    headers = {
        "apikey": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "Authorization": f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}",
        "Content-Type": "application/json",
        "Prefer": "merge-duplicates"
    }
    
    payload = []
    for g in GIANTS:
        # We set them as 'GOLD' so the Refinery Agent picks them up directly for deep enrichment
        payload.append({
            "name": g["name"],
            "country": g["country"],
            "description": f"Target Giant for GTM Strategy: {g['vertical']}",
            "status": "GOLD" 
        })
    
    r = requests.post(url, headers=headers, json=payload)
    if r.status_code in [200, 201]:
        print(f"Successfully injected {len(payload)} Strategic Giants into the pipeline.")
    else:
        print(f"Injection failed: {r.status_code} - {r.text}")

if __name__ == "__main__":
    force_inject_giants()
