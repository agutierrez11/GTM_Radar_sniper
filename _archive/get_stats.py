import os
import requests
from dotenv import load_dotenv

load_dotenv('engine/.env')
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Range': '0-0',
    'Prefer': 'count=exact'
}

def get_stats():
    # Enriched
    r_enriched = requests.get(f'{url}/rest/v1/empresas?status=eq.ENRIQUECIDO&select=count', headers=headers)
    enriched = r_enriched.headers.get('Content-Range', '0/0').split('/')[-1]
    
    # Total
    r_total = requests.get(f'{url}/rest/v1/empresas?select=count', headers=headers)
    total = r_total.headers.get('Content-Range', '0/0').split('/')[-1]
    
    # Junk
    r_junk = requests.get(f'{url}/rest/v1/empresas?status=eq.JUNK&select=count', headers=headers)
    junk = r_junk.headers.get('Content-Range', '0/0').split('/')[-1]

    # No URL (Ready for Audit)
    r_no_url_status = requests.get(f'{url}/rest/v1/empresas?status=eq.NO_URL&select=count', headers=headers)
    no_url_status = r_no_url_status.headers.get('Content-Range', '0/0').split('/')[-1]

    # Pending Scraping
    r_pending = requests.get(f'{url}/rest/v1/empresas?status=eq.CASCARON_PENDIENTE&select=count', headers=headers)
    pending = r_pending.headers.get('Content-Range', '0/0').split('/')[-1]

    # Audit Review
    r_review = requests.get(f'{url}/rest/v1/empresas?status=eq.AUDIT_REVIEW&select=count', headers=headers)
    review = r_review.headers.get('Content-Range', '0/0').split('/')[-1]

    print(f"Total: {total}")
    print(f"Enriched: {enriched}")
    print(f"Junk: {junk}")
    print(f"Cascara Pendiente: {pending}")
    print(f"Waiting for Audit (NO_URL): {no_url_status}")
    print(f"Audit Review Required: {review}")

if __name__ == "__main__":
    get_stats()
