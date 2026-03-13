import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../engine/.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def update_lead(name, website):
    url = f"{SUPABASE_URL}/rest/v1/empresas?name=ilike.*{name}*"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "website": website,
        "status": "CASCARON_PENDIENTE",
        "scan_error": None
    }
    try:
        r = requests.patch(url, headers=headers, json=payload)
        if r.status_code in [200, 204]:
            print(f"[OK] {name} updated to {website}")
        else:
            print(f"[ERR] {name} - {r.status_code}: {r.text}")
    except Exception as e:
        print(f"[EXC] {name} - {e}")

if __name__ == "__main__":
    targets = [
        ("Yape", "https://www.yape.com.pe"),
        ("Prestapolis", "https://www.prestapolis.com"),
        ("Arrenda", "https://blog.arrenda.mx/arrenda-el-futuro-de-los-servicios-financieros-para-el-sector-inmobiliario-en-latam"),
        ("Lounn", "https://www.lounn.mx/"),
        ("Credicorp Capital", "https://www.credicorpcapital.com/Paginas/NHome.aspx"),
        ("Plexo", "https://www.plexo.com.uy/"),
        ("Openpay", "https://www.openpay.mx/"),
        ("Movii", "https://www.movii.com.co/")
    ]
    for n, w in targets:
        update_lead(n, w)
