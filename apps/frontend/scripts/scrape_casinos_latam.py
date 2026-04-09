"""
NERV — Casino LATAM Scraper
Scrape casino.org para 6 países LATAM → inyecta en empresas_v3
"""
import os, re, time, json, requests
from dotenv import load_dotenv

load_dotenv(r'C:\Users\Antonio\Desktop\.env.local')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'es-MX,es;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

SUPABASE_HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
}

PAGES = {
    'México':    'https://www.casino.org/es-mx/',
    'Brasil':    'https://www.casino.org/pt-br/',
    'Argentina': 'https://www.casino.org/argentina/',
    'Chile':     'https://www.casino.org/es-cl/',
    'Perú':      'https://www.casino.org/pe/',
    'Ecuador':   'https://www.casino.org/ec/',
    'Costa Rica':'https://www.casino.org/es-cr/',
}

# Patrones para extraer nombres de casinos del HTML
CASINO_PATTERNS = [
    r'(?:alt|title)="([^"]+(?:Casino|Bet|Win|Play|Spin|Game|Luck|Royal|Vegas|Fortune|Stars|Poker|Sport)[^"]*)"',
    r'<h\d[^>]*>([^<]+(?:Casino|Bet|Win|Play|Spin|Game|Stars)[^<]*)</h\d>',
    r'"name"\s*:\s*"([^"]+(?:Casino|Bet|Win|Play|Spin|Game|Stars)[^"]*)"',
    r'casino-review[^>]*>([^<]{5,50})</a>',
]

# Pain de pagos genérico para operadores iGaming en LATAM
def generate_killer_argument(nombre, mercados):
    mercados_str = ', '.join(mercados) if isinstance(mercados, list) else mercados
    return (
        f"{nombre} enfrenta tasas de rechazo del 30-60% en depósitos con tarjeta internacional en {mercados_str}. "
        f"Los jugadores locales esperan métodos de pago nativos (PIX, OXXO, SPEI, PSE) pero el stack de pagos "
        f"del operador fue construido para rieles europeos. Cada depósito fallido es un jugador perdido permanentemente — "
        f"el costo de adquisición ya fue gastado pero el GGR nunca se materializa. "
        f"Los retiros a cuentas bancarias locales tardan 5-10 días hábiles, generando los tickets de soporte "
        f"de mayor volumen y destruyendo el LTV del jugador después de su primer retiro significativo."
    )

def generate_strategic_hook(nombre):
    return (
        f"Si {nombre} midiera la tasa de conversión entre registro y primer depósito exitoso en LATAM, "
        f"¿qué porcentaje de jugadores abandona en el paso de pago — y han identificado qué método "
        f"intentaban usar cuando se fueron?"
    )

def generate_uvp(nombre):
    return (
        f"{nombre} ofrece entretenimiento de casino online con una amplia biblioteca de juegos, "
        f"bonos de bienvenida y programa de lealtad para jugadores en mercados LATAM."
    )

def extract_casinos_from_html(html, pais):
    """Extrae nombres de casinos del HTML de casino.org"""
    casinos = set()

    # Buscar en texto plano nombres de casino comunes
    known_brands = [
        'Jackpot City', 'JackpotCity', 'Stake', 'Ruby Fortune', 'Spin Casino',
        'Gaming Club', 'Betway', 'Codere', 'BC Game', 'Brazino777', 'WinPot',
        'PlayUZU', 'Campobet', 'Mostbet', 'Betsson', 'Caliente', 'Strendus',
        'Sportium', 'Betmaster', 'MagicRed', 'Royal Yak', '888 Casino',
        'LeoVegas', 'PokerStars', 'William Hill', 'Bet365', 'Unibet',
        'Pinnacle', '1xBet', 'Bwin', 'Mansion Casino', 'Mr Green',
        'Casumo', 'Rizk', 'Dunder', 'Genesis Casino', 'Wildz',
        'Quickwin', 'Royal Vegas', 'Captain Cooks', 'Zodiac Casino',
        'Winner Casino', 'Emotion Casino', 'Jubilee Casino', 'Concorde',
        'Grand Casino', 'Fiesta Casino', 'Lucky Red', 'Slotocash',
        'Bodog', 'Bovada', 'Sportingbet', 'Codere', 'Apuesta Total',
        'Dorado Bet', 'Inkabet', 'Betano', 'Rivalo', 'Luckia',
        'Zitro', 'Cirsa', 'Codere Online', 'Versus',
        'Casino Gran Madrid', 'PokerStars Casino', 'PartyPoker',
        'bet-at-home', 'NetBet', 'Paf Casino', 'Videoslots',
        'Energy Casino', 'Slotty Vegas', 'Casino Planet',
        'GunsBet', 'Explosino', 'BetAmo', 'iLucki', 'Bitstarz',
        'Crypto Casino', 'Mbit Casino', 'FortuneJack', 'Cloudbet',
    ]

    for brand in known_brands:
        if brand.lower() in html.lower():
            casinos.add(brand)

    # También extraer con regex
    for pattern in CASINO_PATTERNS:
        matches = re.findall(pattern, html, re.IGNORECASE)
        for m in matches:
            m = m.strip()
            if 5 < len(m) < 50 and any(kw in m.lower() for kw in ['casino', 'bet', 'win', 'play', 'spin', 'game', 'luck', 'vegas', 'fortune']):
                casinos.add(m)

    return list(casinos)

def scrape_all_pages():
    """Scrape todas las páginas y consolida casinos por mercado"""
    casino_markets = {}  # nombre -> set of mercados

    for pais, url in PAGES.items():
        print(f"  Scraping {pais}... ", end='', flush=True)
        try:
            r = requests.get(url, headers=HEADERS, timeout=20)
            if r.status_code == 200:
                casinos = extract_casinos_from_html(r.text, pais)
                print(f"{len(casinos)} encontrados")
                for c in casinos:
                    if c not in casino_markets:
                        casino_markets[c] = set()
                    casino_markets[c].add(pais)
            else:
                print(f"HTTP {r.status_code}")
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(1.5)  # rate limiting

    return casino_markets

def build_records(casino_markets):
    """Construye los registros para Supabase"""
    records = []

    # Casinos con mayor presencia = Tier 1
    tier1_brands = {'Stake', 'Betway', 'Codere', 'Betsson', '1xBet', 'Bet365',
                    'LeoVegas', 'PokerStars', 'William Hill', 'Bodog', 'Betano',
                    'BC Game', 'Mostbet'}

    for nombre, mercados_set in casino_markets.items():
        mercados = sorted(list(mercados_set))
        tier = 'Tier 1' if nombre in tier1_brands or len(mercados) >= 4 else 'Tier 2'

        record = {
            'nombre': nombre,
            'uvp': generate_uvp(nombre),
            'core': f"Operador de casino online y/o apuestas deportivas con presencia en {', '.join(mercados)}.",
            'vertical': 'iGaming',
            'mercados_latam': mercados,
            'killer_argument': generate_killer_argument(nombre, mercados),
            'strategic_hook': generate_strategic_hook(nombre),
            'tier': tier,
            'tier_razon': f"Presencia confirmada en {len(mercados)} mercado(s) LATAM: {', '.join(mercados)}.",
            'pais_hq': 'Malta',  # default para la mayoría
        }
        records.append(record)

    return records

def upload_to_supabase(records):
    """Sube los records a Supabase en batches"""
    BATCH = 50
    total_ok = 0
    total_err = 0

    for i in range(0, len(records), BATCH):
        batch = records[i:i+BATCH]
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/empresas_v3?on_conflict=nombre",
            headers=SUPABASE_HEADERS,
            json=batch,
            timeout=30
        )
        if r.status_code in (200, 201):
            total_ok += len(batch)
            print(f"  Batch {i//BATCH + 1}: {len(batch)} registros OK")
        else:
            total_err += len(batch)
            print(f"  Batch {i//BATCH + 1}: ERROR {r.status_code} — {r.text[:200]}")
        time.sleep(0.5)

    return total_ok, total_err

def main():
    print("=" * 50)
    print("NERV — Casino LATAM Scraper")
    print("=" * 50)

    print("\n[1/3] Scraping casino.org...")
    casino_markets = scrape_all_pages()
    print(f"\n  Total casinos únicos detectados: {len(casino_markets)}")

    print("\n[2/3] Construyendo registros...")
    records = build_records(casino_markets)
    print(f"  Registros preparados: {len(records)}")

    # Guardar JSON de respaldo
    backup_path = r'C:\Users\Antonio\OneDrive\Documents\NERV\casinos_latam_backup.json'
    with open(backup_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"  Backup guardado: casinos_latam_backup.json")

    print(f"\n[3/3] Subiendo a Supabase...")
    ok, err = upload_to_supabase(records)

    print("\n" + "=" * 50)
    print(f"COMPLETADO: {ok} subidos, {err} errores")
    print("=" * 50)

if __name__ == '__main__':
    main()
