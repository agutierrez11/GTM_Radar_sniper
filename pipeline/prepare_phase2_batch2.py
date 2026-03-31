"""
NERV — Preparar Batch 2 para enricher
Toma URLs encontradas, prioriza sitios directos sobre directorios
"""
import pandas as pd
import os

LOOKUP    = r"C:\Users\Antonio\Desktop\NERV_PHASE2_LOOKUP_WITH_URLS.csv"
OUT_BATCH = r"C:\Users\Antonio\Desktop\NERV_PHASE2_BATCH2.csv"

# Directorios que no son el sitio real de la empresa
DIRECTORIES = ["colombiafintech.co/miembros","fintechile.org","latamfintech.co",
               "crunchbase.com","linkedin.com","facebook.com","twitter.com",
               "wikipedia.org","bloomberg.com","instagram.com"]

df = pd.read_csv(LOOKUP, encoding="utf-8-sig")

# Solo las que tienen URL
with_url = df[df["website_found"].notna() & (df["website_found"].str.strip() != "")].copy()

# Clasificar: sitio directo vs directorio
def is_directory(url):
    return any(d in str(url).lower() for d in DIRECTORIES)

with_url["es_directorio"] = with_url["website_found"].apply(is_directory)
directos    = with_url[~with_url["es_directorio"]]
directorios = with_url[with_url["es_directorio"]]

print(f"URLs encontradas:  {len(with_url):,}")
print(f"Sitios directos:   {len(directos):,}  ← calidad alta")
print(f"Páginas directorio:{len(directorios):,} ← calidad media")
print(f"Sin URL:           {len(df) - len(with_url):,}")

# Usar website_found como website para el enricher
with_url = with_url.reset_index(drop=True)

# Usar website_found como website, eliminar columna website original
with_url = with_url.drop(columns=["website", "es_directorio", "website.1"], errors="ignore")
with_url = with_url.rename(columns={"website_found": "website"})

# Ordenar: directos primero, luego directorios
dir_flags = with_url["website"].apply(is_directory).tolist()
with_url.insert(0, "_dir", dir_flags)
with_url = with_url.sort_values("_dir").drop(columns=["_dir"]).reset_index(drop=True)

with_url.to_csv(OUT_BATCH, index=False, encoding="utf-8-sig")
print(f"\n✅ Batch 2 listo: {OUT_BATCH}")
print(f"   → {len(with_url):,} empresas para enriquecer")
print(f"   ETA enrichment: ~{len(with_url) * 10 / 3600:.1f} horas")
