import os, requests, re, json
from dotenv import load_dotenv
load_dotenv('engine/.env')

URL = os.getenv('SUPABASE_URL')
KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
HEADERS = {'apikey': KEY, 'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'}

JUNK_PATTERNS = [
    r"que buscan", r"empresa de", r"plataforma para", 
    r"solución de", r"instituciones financieras", r"en busca de",
    r"ej\.", r"pyme", r"fintechs", r"empresa que", r"individuos",
    r"comerciantes", r"consultoras", r"corretoras", r"plataformas de",
    r"sub-bancarizados", r"bancarizados", r"pequeños comerciantes",
    r"necesitan", r"sector", r"segmento", r"tradicionales", r"como adquirente"
]

def purge_junk():
    print("🚀 Iniciando Protocolo de Limpieza de Basura...")
    # Fetch a large batch of NO_URL or PENDIENTE leads
    r = requests.get(f"{URL}/rest/v1/empresas?select=id,name&limit=5000", headers=HEADERS)
    leads = r.json()
    
    purged_count = 0
    for lead in leads:
        name = lead.get('name', '')
        lid = lead.get('id')
        
        word_count = len(name.split())
        is_junk = word_count > 5 or any(re.search(p, name, re.I) for p in JUNK_PATTERNS)
        
        if is_junk:
            # Mark as JUNK
            print(f"🧹 PURGING: {name}")
            requests.patch(f"{URL}/rest/v1/empresas?id=eq.{lid}", 
                           headers=HEADERS, 
                           json={"status": "JUNK", "scan_error": "PURGED_BY_ASEPTIC_CLEANER"})
            purged_count += 1
            
    print(f"✅ Limpieza completada. {purged_count} registros marcados como JUNK.")

if __name__ == "__main__":
    purge_junk()
