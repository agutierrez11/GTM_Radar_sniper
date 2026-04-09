import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

leads = [
    # URLs de Entrevistas/Reguladores
    {"url": "alea.org.ar", "sector": "Regulatory/Gaming", "name": "ALEA"},
    {"url": "lotba.gob.ar", "sector": "Regulatory/Gaming", "name": "LOTBA"},
    {"url": "coljuegos.gov.co", "sector": "Regulatory/Gaming", "name": "Coljuegos"},
    {"url": "gob.mx/segob", "sector": "Regulatory/Government", "name": "SEGOB México"},
    {"url": "mincetur.gob.pe", "sector": "Regulatory/Tourism", "name": "MINCETUR Perú"},
    
    # SaaS & Cloud - Gigantes
    {"url": "totvs.com", "sector": "SaaS & Cloud", "name": "TOTVS"},
    {"url": "rdstation.com", "sector": "SaaS & Cloud", "name": "RD Station"},
    {"url": "tiendanube.com", "sector": "SaaS & Cloud", "name": "Tiendanube"},
    {"url": "vtex.com", "sector": "SaaS & Cloud", "name": "VTEX"},
    {"url": "contaazul.com.br", "sector": "SaaS & Cloud", "name": "Conta Azuul"},
    
    # SaaS & Cloud - Medianos
    {"url": "nuvemshop.com.br", "sector": "SaaS & Cloud", "name": "Nuvemshop"},
    {"url": "zenvia.com", "sector": "SaaS & Cloud", "name": "Zenvia"},
    {"url": "olist.com", "sector": "SaaS & Cloud", "name": "Olist"},
    {"url": "leadsales.io", "sector": "SaaS & Cloud", "name": "Leadsales"},
    {"url": "portermetrics.com", "sector": "SaaS & Cloud", "name": "Porter Metrics"},
    
    # Gaming - Gigantes
    {"url": "level.com.br", "sector": "Gaming", "name": "Level Up!"},
    {"url": "garena.com.br", "sector": "Gaming", "name": "Garena BR"},
    {"url": "riot.com/es-mx", "sector": "Gaming", "name": "Riot Games MX"},
    {"url": "kingston.com/latam", "sector": "Gaming/Tech", "name": "Kingston Latam"},
    {"url": "nuuvem.com", "sector": "Gaming/Store", "name": "Nuuvem"},
    
    # Streaming - Gigantes
    {"url": "globoplay.globo.com", "sector": "Streaming", "name": "Globoplay"},
    {"url": "blim.tv", "sector": "Streaming", "name": "Blim TV"},
    {"url": "canela.tv", "sector": "Streaming", "name": "Canela TV"},
    
    # E-commerce - Gigantes
    {"url": "mercadolibre.com", "sector": "E-commerce", "name": "Mercado Libre"},
    {"url": "falabella.com", "sector": "E-commerce", "name": "Falabella"},
    {"url": "liverpool.com.mx", "sector": "E-commerce", "name": "Liverpool MX"},
    
    # Travel & OTA - Gigantes
    {"url": "despegar.com", "sector": "Travel", "name": "Despegar"},
    {"url": "decolar.com", "sector": "Travel", "name": "Decolar"}
]

def ingest_lead(lead):
    url = f"{SUPABASE_URL}/rest/v1/empresas"
    payload = {
        "name": lead["name"],
        "website": lead["url"],
        "sector": lead["sector"],
        "status": "pending",
        "infra_potential": True # Marcados como alta prioridad por el Lookalike de EBANX
    }
    r = requests.post(url, headers=headers, json=payload)
    if r.status_code in [200, 201]:
        print(f"Success: {lead['name']}")
    else:
        print(f"Error {lead['name']}: {r.status_code} - {r.text}")

if __name__ == "__main__":
    for l in leads:
        ingest_lead(l)
