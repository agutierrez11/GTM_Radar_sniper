import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))

def stats_and_noise_check():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Prefer": "count=exact"
    }
    
    table = "fintech_leads"
    
    print(f"--- ESTADÍSTICAS TOTALES EN {table} ---")
    
    try:
        # Total
        r_total = requests.get(f"{url}/rest/v1/{table}?select=id", headers=headers)
        total_count = r_total.headers.get("Content-Range", "0-0/0").split("/")[-1]
        
        # Procesados
        r_done = requests.get(f"{url}/rest/v1/{table}?raw_scraped_text=not.is.null&select=id", headers=headers)
        done_count = r_done.headers.get("Content-Range", "0-0/0").split("/")[-1]
        
        # Pendientes
        r_pending = requests.get(f"{url}/rest/v1/{table}?raw_scraped_text=is.null&select=id", headers=headers)
        pending_count = r_pending.headers.get("Content-Range", "0-0/0").split("/")[-1]
        
        print(f"Total leads: {total_count}")
        print(f"Procesados: {done_count}")
        print(f"Pendientes: {pending_count}")
        
        # Búsqueda de Ruido (Keywords de Blogs/Noticias)
        noise_keywords = ["/blog/", "/noticias/", "/news/", "/press/", "/articulos/", "medium.com", "forbes", "bloomberg"]
        print(f"\n--- BUSCANDO RUIDO (POSIBLES BLOGS/NOTICIAS) ---")
        
        for kw in noise_keywords:
            r_noise = requests.get(f"{url}/rest/v1/{table}?website_url=ilike.*{kw}*&select=company_name,website_url", headers=headers)
            noise_items = r_noise.json()
            if noise_items:
                print(f"Encontrados con '{kw}': {len(noise_items)}")
                for item in noise_items[:3]:
                    print(f"  - {item.get('company_name')} | {item.get('website_url')}")
            else:
                print(f"No hay coincidencias para '{kw}'.")

    except Exception as e:
        print(f"[ERROR] {e}")

if __name__ == "__main__":
    stats_and_noise_check()
