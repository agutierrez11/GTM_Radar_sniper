#!/usr/bin/env python3
"""
scrape_igaming_full.py
Scrapes multiple iGaming directories and uploads results to Supabase empresas_v3.
"""

import time
import json
import re
import os
import sys
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

# ── CONFIG ────────────────────────────────────────────────────────────────────

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
TABLE        = "empresas_v3"
BACKUP_PATH  = "C:/Users/Antonio/OneDrive/Documents/NERV/igaming_full_backup.json"

DELAY = 1.5   # seconds between HTTP requests

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

TOP_BRANDS = {
    "stake", "codere", "betway", "betsson", "1xbet", "bet365",
    "leovegas", "bodog", "betano", "bc game",
}

# Full known-brands list (lower-cased for matching)
KNOWN_BRANDS = [b.strip() for b in """
Stake, Codere, Betway, Betsson, 1xBet, Bet365, LeoVegas, BC Game, WinPot, Caliente, Strendus,
Sportium, Betmaster, MagicRed, Bodog, Betano, Rivalo, Luckia, Rush Street, DraftKings, FanDuel,
Bwin, Unibet, Pinnacle, 888 Casino, PokerStars, William Hill, Mansion Casino, Mr Green,
Casumo, Rizk, Genesis Casino, Wildz, Quickwin, Royal Vegas, Jackpot City, Spin Casino,
Gaming Club, Ruby Fortune, Brazino777, PlayUZU, Campobet, Mostbet, Inkabet, Apuesta Total,
Dorado Bet, Codere Online, Versus, Zitro, Cirsa, Betsafe, Expekt, NordicBet,
ComeOn, Thrills, Dunder, Videoslots, Energy Casino, Bitstarz, BitcoinCasino, FortuneJack,
Cloudbet, Mbit Casino, Rollbit, Roobet, Fairspin, Vave, Mystake, Betibet, Coinplay,
Sportsbet.io, Bitcasino, Metaspins, Shuffle, Duelbits, Punt Casino, Bets.io, Winz.io,
TrueFlip, Vegaz, CryptoLeo, Megapari, 1Win, Melbet, PinUp, Linebet, Vbet,
Parimatch, Sportaza, Rabona, Cadoola, Slotbox, Zet Casino, Tsars, Yabby Casino,
Turbo Casino, Haz Casino, Drift Casino, Wazamba, Spinia, Syndicate Casino
""".split(",")]

LATAM_COUNTRIES = ["Mexico", "Brasil", "Colombia", "Argentina", "Chile", "Peru"]

CASINO_GURU_URLS = [
    ("casino.guru General",   "https://casino.guru/es/casinos-online"),
    ("casino.guru Mexico",    "https://casino.guru/es/casinos-online/mexico"),
    ("casino.guru Brasil",    "https://casino.guru/es/casinos-online/brasil"),
    ("casino.guru Colombia",  "https://casino.guru/es/casinos-online/colombia"),
    ("casino.guru Argentina", "https://casino.guru/es/casinos-online/argentina"),
    ("casino.guru Chile",     "https://casino.guru/es/casinos-online/chile"),
    ("casino.guru Peru",      "https://casino.guru/es/casinos-online/peru"),
]

# ── HELPERS ───────────────────────────────────────────────────────────────────

def get(url: str) -> requests.Response | None:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        if resp.status_code == 200:
            return resp
        print(f"  [WARN] {url} → HTTP {resp.status_code}")
        return None
    except Exception as e:
        print(f"  [ERR]  {url} → {e}")
        return None


def soup(resp: requests.Response) -> BeautifulSoup:
    return BeautifulSoup(resp.text, "html.parser")


def clean_name(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def extract_domain(url: str) -> str:
    try:
        p = urlparse(url)
        host = p.netloc.lower().lstrip("www.")
        return host or url
    except Exception:
        return url


def scan_known_brands(html_text: str) -> list[str]:
    """Find any known brand names mentioned anywhere in raw HTML."""
    found = []
    lower = html_text.lower()
    for brand in KNOWN_BRANDS:
        b = brand.strip()
        if not b:
            continue
        if b.lower() in lower:
            found.append(b)
    return found


def build_record(nombre: str, website: str, mercados: list[str]) -> dict:
    mercados_str = ", ".join(mercados) if mercados else "LATAM"
    is_top = nombre.lower() in TOP_BRANDS
    tier = "Tier 1" if is_top else "Tier 2"
    n = len(mercados) if mercados else 1
    return {
        "nombre":           nombre,
        "uvp":              f"{nombre} ofrece entretenimiento de casino online y/o apuestas deportivas con presencia en mercados LATAM.",
        "core":             f"Operador de casino online y/o apuestas deportivas con presencia en {mercados_str}.",
        "vertical":         "iGaming",
        "mercados_latam":   mercados if mercados else [],
        "killer_argument":  (
            f"{nombre} enfrenta tasas de rechazo del 30-60% en depósitos con tarjeta internacional "
            f"en {mercados_str}. Los jugadores locales esperan PIX, OXXO, SPEI, PSE pero el stack "
            f"de pagos fue construido para rieles europeos. Cada depósito fallido es un jugador perdido "
            f"— el CAC ya fue gastado pero el GGR nunca se materializa."
        ),
        "strategic_hook":   (
            "¿Cuál es tu tasa de conversión entre registro y primer depósito exitoso en LATAM "
            "— y han identificado qué método intentaban usar los jugadores que abandonaron?"
        ),
        "tier":             tier,
        "tier_razon":       f"Operador iGaming con presencia confirmada en {n} mercados LATAM.",
        "website":          website,
        "pais_hq":          "Malta",
    }


# ── SCRAPERS ──────────────────────────────────────────────────────────────────

def scrape_affpapa() -> list[tuple[str, str, list[str]]]:
    """Returns list of (nombre, website, mercados)."""
    results: list[tuple[str, str, list[str]]] = []
    source = "AffPapa"
    print(f"\n{'='*60}")
    print(f"SOURCE: {source}")
    print(f"{'='*60}")

    for page in range(1, 11):
        if page == 1:
            url = "https://affpapa.com/igaming-operators/"
        else:
            url = f"https://affpapa.com/igaming-operators/page/{page}/"

        print(f"  Fetching page {page}: {url}")
        resp = get(url)
        time.sleep(DELAY)

        if resp is None:
            print(f"  Stopping at page {page} (no response).")
            break

        s = soup(resp)

        # AffPapa operator cards — try multiple selectors
        cards = (
            s.select("article.operator-card")
            or s.select("div.operator-card")
            or s.select("div.card")
            or s.select("article")
        )

        page_count = 0
        for card in cards:
            # Name
            name_el = (
                card.select_one("h2") or card.select_one("h3")
                or card.select_one(".card-title") or card.select_one(".operator-name")
            )
            if not name_el:
                continue
            nombre = clean_name(name_el.get_text())
            if not nombre or len(nombre) < 2:
                continue

            # Website link
            link_el = card.select_one("a[href]")
            website = ""
            if link_el:
                href = link_el.get("href", "")
                # Prefer external links over relative paths
                if href.startswith("http") and "affpapa.com" not in href:
                    website = href
                elif href.startswith("/") or "affpapa.com" in href:
                    website = ""  # internal link — skip

            results.append((nombre, website, []))
            page_count += 1

        # Also scan for known brands in HTML
        for brand in scan_known_brands(resp.text):
            results.append((brand, "", []))

        print(f"  Page {page}: {page_count} operator cards found")

        # Stop early if page returns the same content as page 1 (no pagination)
        if page_count == 0:
            print(f"  No cards on page {page}, stopping pagination.")
            break

    print(f"  {source} total raw: {len(results)}")
    return results


def scrape_casino_guru() -> list[tuple[str, str, list[str]]]:
    """Returns list of (nombre, website, mercados)."""
    results: list[tuple[str, str, list[str]]] = []

    print(f"\n{'='*60}")
    print(f"SOURCE: casino.guru (LATAM pages)")
    print(f"{'='*60}")

    for label, url in CASINO_GURU_URLS:
        # Derive country from label
        country_part = label.replace("casino.guru ", "").strip()
        mercado = country_part if country_part != "General" else ""

        print(f"  Fetching: {label}")
        resp = get(url)
        time.sleep(DELAY)

        if resp is None:
            continue

        s = soup(resp)

        page_count = 0

        # casino.guru casino list items
        casino_items = (
            s.select("div.casino-list-item")
            or s.select("article.casino-item")
            or s.select("div[class*='casino']")
            or s.select("li.casino-list-item")
        )

        for item in casino_items:
            name_el = (
                item.select_one("h2") or item.select_one("h3")
                or item.select_one(".casino-name") or item.select_one("a[class*='name']")
                or item.select_one("strong") or item.select_one("a")
            )
            if not name_el:
                continue
            nombre = clean_name(name_el.get_text())
            if not nombre or len(nombre) < 2:
                continue

            # Try to find the casino's external website link
            website = ""
            for a in item.select("a[href]"):
                href = a.get("href", "")
                if "casino.guru" not in href and href.startswith("http"):
                    website = href
                    break

            mercados = [mercado] if mercado else []
            results.append((nombre, website, mercados))
            page_count += 1

        # Fallback: scan for known brands
        for brand in scan_known_brands(resp.text):
            m = [mercado] if mercado else []
            results.append((brand, "", m))

        print(f"  {label}: {page_count} casino items extracted")

    print(f"  casino.guru total raw: {len(results)}")
    return results


def scrape_igaming_mexico() -> list[tuple[str, str, list[str]]]:
    """Returns list of (nombre, website, mercados)."""
    results: list[tuple[str, str, list[str]]] = []
    source = "iGaming Mexico"
    url = "https://www.igamingmexico.mx/es"

    print(f"\n{'='*60}")
    print(f"SOURCE: {source}")
    print(f"{'='*60}")
    print(f"  Fetching: {url}")

    resp = get(url)
    time.sleep(DELAY)

    if resp is None:
        print(f"  Could not reach {source}")
        return results

    s = soup(resp)

    # Extract article/content text and look for company names
    content_text = s.get_text(" ", strip=True)

    # Known brands scan
    for brand in scan_known_brands(resp.text):
        results.append((brand, "", ["Mexico"]))

    # Also try to extract article links / company mentions
    for a in s.select("a[href]"):
        text = clean_name(a.get_text())
        href = a.get("href", "")
        if (
            text and len(text) > 2 and len(text) < 60
            and not text.lower().startswith("http")
            and any(kw in text.lower() for kw in ["casino", "bet", "game", "sport", "play"])
        ):
            website = href if href.startswith("http") and "igamingmexico" not in href else ""
            results.append((text, website, ["Mexico"]))

    print(f"  {source}: {len(results)} raw mentions found")
    return results


def scrape_known_brands_fallback() -> list[tuple[str, str, list[str]]]:
    """Ensure all known brands appear at minimum as Mexico entries."""
    results = []
    for brand in KNOWN_BRANDS:
        b = brand.strip()
        if b:
            results.append((b, "", []))
    return results


# ── DEDUPLICATION ─────────────────────────────────────────────────────────────

def deduplicate(
    raw: list[tuple[str, str, list[str]]]
) -> dict[str, dict]:
    """
    Merge entries by lower-cased nombre.
    Accumulates mercados, keeps first non-empty website.
    Returns dict keyed by canonical nombre.
    """
    registry: dict[str, dict] = {}

    for nombre, website, mercados in raw:
        nombre = clean_name(nombre)
        if not nombre or len(nombre) < 2:
            continue

        key = nombre.lower()

        if key not in registry:
            registry[key] = {
                "nombre":   nombre,
                "website":  website,
                "mercados": list(mercados),
            }
        else:
            # Merge website
            if not registry[key]["website"] and website:
                registry[key]["website"] = website
            # Merge mercados
            for m in mercados:
                if m and m not in registry[key]["mercados"]:
                    registry[key]["mercados"].append(m)

    return registry


# ── SUPABASE UPLOAD ───────────────────────────────────────────────────────────

def upload_to_supabase(records: list[dict], batch_size: int = 20) -> int:
    url = f"{SUPABASE_URL}/rest/v1/{TABLE}"
    headers = {
        "apikey":        SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type":  "application/json",
        "Prefer":        "resolution=merge-duplicates,return=minimal",
    }
    params = {"on_conflict": "nombre"}

    uploaded = 0
    total = len(records)

    for i in range(0, total, batch_size):
        batch = records[i : i + batch_size]
        try:
            resp = requests.post(url, headers=headers, params=params, json=batch, timeout=30)
            if resp.status_code in (200, 201):
                uploaded += len(batch)
                print(f"  Uploaded batch {i // batch_size + 1}: records {i+1}-{min(i+batch_size, total)} ✓")
            else:
                print(f"  [WARN] Batch {i // batch_size + 1} → HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"  [ERR] Batch {i // batch_size + 1} failed: {e}")

    return uploaded


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    print("\n" + "="*60)
    print("  iGaming Full Scraper — starting")
    print("="*60)

    all_raw: list[tuple[str, str, list[str]]] = []

    # 1. AffPapa
    all_raw.extend(scrape_affpapa())

    # 2. casino.guru LATAM
    all_raw.extend(scrape_casino_guru())

    # 3. iGaming Mexico
    all_raw.extend(scrape_igaming_mexico())

    # 4. Known-brands fallback (ensures every listed brand is included)
    all_raw.extend(scrape_known_brands_fallback())

    print(f"\n{'='*60}")
    print(f"  Total raw entries collected: {len(all_raw)}")

    # Deduplicate
    registry = deduplicate(all_raw)
    print(f"  Unique operators after deduplication: {len(registry)}")

    # Build final records
    records = []
    for key, data in registry.items():
        rec = build_record(
            nombre   = data["nombre"],
            website  = data["website"],
            mercados = data["mercados"],
        )
        records.append(rec)

    # Sort by nombre for readability
    records.sort(key=lambda r: r["nombre"].lower())

    # Save JSON backup
    print(f"\n  Saving JSON backup to: {BACKUP_PATH}")
    os.makedirs(os.path.dirname(BACKUP_PATH), exist_ok=True)
    with open(BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"  Backup saved: {len(records)} records")

    # Upload to Supabase
    print(f"\n{'='*60}")
    print(f"  Uploading {len(records)} records to Supabase → {TABLE}")
    print(f"{'='*60}")
    uploaded = upload_to_supabase(records, batch_size=20)

    print(f"\n{'='*60}")
    print(f"  DONE")
    print(f"  Total unique operators:  {len(records)}")
    print(f"  Successfully uploaded:   {uploaded}")
    print(f"  Backup file:             {BACKUP_PATH}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
