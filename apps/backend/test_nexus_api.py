#!/usr/bin/env python3
"""POST de humo a /empresas/nexus (prod equalitech o URL en env)."""
import json
import os
import sys

try:
    import requests
except ImportError:
    print("pip install requests", file=sys.stderr)
    sys.exit(1)

BASE = os.environ.get("NERV_API_BASE", "https://nerv.equalitech.xyz").rstrip("/")
URL = f"{BASE}/empresas/nexus"

PAYLOAD = {
    "brief": {
        "empresa": "Koin",
        "producto": "Antifraude smoke test",
        "pais": "México",
        "vertical": "Payments & Remittances",
        "tier": "Tier1",
    },
    "empresa_supabase": {},
}


def main() -> None:
    print(f"POST {URL}")
    r = requests.post(URL, json=PAYLOAD, headers={"Content-Type": "application/json"}, timeout=120)
    print(f"HTTP {r.status_code}")
    try:
        data = r.json()
        print(json.dumps(data, ensure_ascii=False, indent=2)[:4000])
    except Exception:
        print(r.text[:2000])


if __name__ == "__main__":
    main()
