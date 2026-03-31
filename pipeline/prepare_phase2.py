"""
NERV Phase 2 — Preparación del batch
1. Inyecta 677 URLs del ULTIMATE al master
2. Genera NERV_PHASE2_BATCH.csv con todas las empresas listas para enriquecer
3. Separa las que necesitan URL lookup (solo MX + CO)
"""
import pandas as pd
import os

MASTER     = r"C:\Users\Antonio\Desktop\NERV_MASTER_VERIFIED.csv"
ULTIMATE   = r"C:\Users\Antonio\OneDrive\Downloads\NERV_GOD_MASTER_ULTIMATE_2026.csv"
ENRICHED   = r"C:\Users\Antonio\Desktop\NERV_V12_LOG.json"
OUT_BATCH  = r"C:\Users\Antonio\Desktop\NERV_PHASE2_BATCH.csv"
OUT_LOOKUP = r"C:\Users\Antonio\Desktop\NERV_PHASE2_LOOKUP.csv"

print("=" * 55)
print("  NERV PHASE 2 — Preparación")
print("=" * 55)

# ── Cargar archivos ─────────────────────────────────────
master   = pd.read_csv(MASTER,   encoding="utf-8-sig")
ultimate = pd.read_csv(ULTIMATE, encoding="utf-8-sig", on_bad_lines="skip")
enriched = pd.read_csv(ENRICHED, encoding="utf-8-sig", on_bad_lines="skip")

print(f"  Master total:     {len(master):,}")
print(f"  Ya enriquecidas:  {len(enriched):,}")

# ── Normalizar nombres para match ───────────────────────
def norm(s): return str(s).strip().lower()

# ULTIMATE: solo con website y sin SYNTHESIS
ult_ok = ultimate[
    ultimate["website"].notna() &
    (ultimate["website"].str.strip() != "") &
    (ultimate["website"].astype(str) != "nan") &
    (~ultimate["origen"].astype(str).str.contains("SYNTHESIS", na=False))
].copy()
ult_ok["_norm"] = ult_ok["nombre"].apply(norm)

# Diccionario nombre → URL
url_map = dict(zip(ult_ok["_norm"], ult_ok["website"].str.strip()))

# ── Empresas sin URL en el master ───────────────────────
no_web = master[
    master["website"].isna() | (master["website"].str.strip() == "")
].copy()
no_web["_norm"] = no_web["nombre"].apply(norm)

# ── Inyectar URLs del ULTIMATE ──────────────────────────
recovered = 0
for idx, row in no_web.iterrows():
    url = url_map.get(row["_norm"])
    if url:
        master.at[idx, "website"] = url
        recovered += 1

print(f"  URLs recuperadas: {recovered:,} (del ULTIMATE)")

# ── Filtrar ya enriquecidas (por website) ───────────────
enriched_sites = set(enriched["website"].dropna().str.strip())
enriched_names = set(enriched["nombre"].dropna().apply(norm))

# Empresas con website que NO están enriquecidas aún
with_web = master[
    master["website"].notna() &
    (master["website"].str.strip() != "") &
    (~master["website"].str.strip().isin(enriched_sites))
].copy()

print(f"  Con URL pendientes de enriquecer: {len(with_web):,}")

# ── Sin URL — solo MX + CO para lookup ─────────────────
still_no_web = master[
    master["website"].isna() | (master["website"].str.strip() == "")
].copy()

lookup_batch = still_no_web[
    still_no_web["pais"].str.lower().str.contains(
        "m.xico|mexico|colombia", na=False, regex=True
    )
].copy()

print(f"  Sin URL para lookup (MX+CO): {len(lookup_batch):,}")

# ── Guardar ─────────────────────────────────────────────
with_web.drop(columns=["_norm"], errors="ignore").to_csv(
    OUT_BATCH, index=False, encoding="utf-8-sig"
)
lookup_batch.drop(columns=["_norm"], errors="ignore").to_csv(
    OUT_LOOKUP, index=False, encoding="utf-8-sig"
)

print()
print(f"  ✅ Batch listo:   {OUT_BATCH}")
print(f"     → {len(with_web):,} empresas para enriquecer directamente")
print()
print(f"  ✅ Lookup listo:  {OUT_LOOKUP}")
print(f"     → {len(lookup_batch):,} empresas MX+CO necesitan URL lookup")
print()

# Estimado de créditos Tavily
tavily_signals  = int(len(with_web) * 0.40)   # 40% necesitarán signal (threshold 200)
tavily_lookup   = len(lookup_batch)
total_tavily    = tavily_signals + tavily_lookup
print(f"  Estimado Tavily:")
print(f"     Signals enrichment: ~{tavily_signals}")
print(f"     URL lookups MX+CO:  ~{tavily_lookup}")
print(f"     TOTAL:              ~{total_tavily} créditos")
disponibles = 441 + 743  # cuenta 1 + cuenta 2
print(f"     Disponibles:        ~{disponibles} (441 + 743 dos cuentas)")
if total_tavily <= disponibles:
    print(f"     ✅ Alcanza — margen: ~{disponibles - total_tavily} créditos")
else:
    print(f"     ⚠️  Gap: ~{total_tavily - disponibles} créditos")
print("=" * 55)
