"""
NERV — Knowledge Base Quality Layer
=====================================
Valida datos ANTES de que entren al KB o a Supabase.
Corre en dos modos:
  1. pre_ingest_gate(content, source) → valida un documento antes de embeddear
  2. audit_kb_directory(path)         → audita archivos .md existentes en knowledge_base/

Etiquetas de salida:
  [VERIFICADO]        → fuente primaria citada, dato específico verificable
  [NO_VERIFICADO]     → inferencia o dato sin fuente primaria
  [PROYECCIÓN]        → estimación futura sin metodología documentada
  [SESGO_FUENTE]      → reporte comisionado por vendor o parte interesada
  [DATO_DERIVADO]     → cálculo propio a partir de otros datos
  [VERIFICAR_VIGENCIA]→ dato con timestamp >6 meses o cargo ejecutivo
  [TEMPLATE_CLONADO]  → texto idéntico entre múltiples registros
"""

import os
import re
import sys
import json
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

# ── Constantes ────────────────────────────────────────────────────────────────

BIAS_SOURCES = [
    "mastercard", "visa", "paypal", "stripe", "adyen",
    "comisionado por", "sponsored by", "commissioned by",
    "white paper", "whitepaper", "patrocinado"
]

PROJECTION_SIGNALS = [
    "proyección", "proyectado", "estimación", "estimado", "se espera",
    "para el 2027", "para el 2028", "para el 2029", "para el 2030",
    "projected", "forecast", "expected to", "estimated"
]

DERIVED_SIGNALS = [
    "estimación sectorial", "cálculo propio", "interpolado",
    "dato derivado", "promedio de", "extrapolado"
]

HIGH_PCT_THRESHOLD = 60   # % — porcentajes >60 sin metodología son sospechosos
STALE_DAYS = 180          # días antes de marcar dato como potencialmente obsoleto

# ── Regex pre-compilados (módulo-level para eficiencia) ───────────────────────

_PRIMARY_SOURCE_PATTERNS = [
    re.compile(r'https?://\S+'),
    re.compile(r'\b(CONDUSEF|Banxico|CNBV|BACEN|BCRP|FMI|CEPAL|Banco Mundial)\b'),
    re.compile(r'\b(BioCatch|Finnovista|AMVO|INEGI|GAFI|ABM)\b'),
    re.compile(r'\b(20\d{2})\b'),
    re.compile(r'(fuente|source|según|according to):\s*\S+', re.IGNORECASE),
]

_PERCENTAGE_PATTERN = re.compile(r'(\d{1,3}(?:\.\d+)?)\s*%')

# Cargo ejecutivo — requiere mayúscula después para evitar falsos positivos
# ("director de orquesta" no aplica, "Director de Finanzas" sí)
_EXECUTIVE_PATTERN = re.compile(
    r'\b(CEO|CTO|CFO|COO|VP de|Director de [A-Z]|Chief [A-Z])\b'
)

# ── Utilidades ────────────────────────────────────────────────────────────────

def _extract_percentages(text: str) -> list[float]:
    """Extrae todos los porcentajes del texto."""
    return [float(m) for m in _PERCENTAGE_PATTERN.findall(text)]

def _has_primary_source(text: str) -> bool:
    """Verifica si el texto cita fuente primaria. Short-circuits en primer match."""
    return any(pat.search(text) for pat in _PRIMARY_SOURCE_PATTERNS)

def _is_stale(text: str) -> bool:
    """
    Detecta datos potencialmente obsoletos.
    Usa STALE_DAYS como umbral dinámico en lugar de regex de año hardcodeado.
    """
    cutoff_year = (datetime.now() - timedelta(days=STALE_DAYS)).year
    years = [int(y) for y in re.findall(r'\b(20\d{2})\b', text)]
    if years and min(years) < cutoff_year:
        return True
    return bool(_EXECUTIVE_PATTERN.search(text))

def _text_hash(text: str) -> str:
    return hashlib.md5(text.strip().lower().encode()).hexdigest()

# ── Validador de bloque ────────────────────────────────────────────────────────

def validate_block(text: str, source: str = "") -> dict:
    """
    Valida un bloque de texto. Single-pass sobre el texto para eficiencia.
    Retorna dict con: tags, risk, warnings.
    """
    tags = []
    warnings = []
    source_lower = source.lower()

    # Single-pass: extraer porcentajes y verificar fuente juntos
    percentages = _extract_percentages(text)
    has_source = _has_primary_source(text)

    # 1. Sesgo de fuente
    if any(b in source_lower for b in BIAS_SOURCES):
        tags.append("[SESGO_FUENTE]")
        warnings.append(f"Fuente potencialmente sesgada: '{source}'")

    # 2. Proyecciones futuras
    if any(p in text.lower() for p in PROJECTION_SIGNALS):
        tags.append("[PROYECCIÓN]")
        warnings.append("Contiene estimaciones futuras sin metodología documentada")

    # 3. Datos derivados
    if any(d in text.lower() for d in DERIVED_SIGNALS):
        tags.append("[DATO_DERIVADO]")
        warnings.append("Dato calculado o interpolado — verificar metodología")

    # 4. Porcentajes altos sin fuente primaria
    high_pcts = [p for p in percentages if p > HIGH_PCT_THRESHOLD]
    if high_pcts and not has_source:
        tags.append("[NO_VERIFICADO]")
        warnings.append(f"Porcentajes altos sin fuente primaria: {high_pcts}")

    # 5. Sin fuente primaria (solo si no hay otras flags aún)
    if not has_source and not tags:
        tags.append("[NO_VERIFICADO]")
        warnings.append("No se detectó fuente primaria citada")

    # 6. Datos obsoletos o cargos ejecutivos
    if _is_stale(text):
        tags.append("[VERIFICAR_VIGENCIA]")
        warnings.append("Dato con posible desactualización — verificar vigencia")

    # 7. Verificado (sin flags)
    if not tags:
        tags.append("[VERIFICADO]")

    # ── Nivel de riesgo ──────────────────────────────────────────────────────
    risk = "BAJO"

    if "[SESGO_FUENTE]" in tags and ("[NO_VERIFICADO]" in tags or "[PROYECCIÓN]" in tags):
        risk = "CRÍTICO"
    elif "[SESGO_FUENTE]" in tags or "[NO_VERIFICADO]" in tags:
        risk = "ALTO"
    elif "[PROYECCIÓN]" in tags or "[DATO_DERIVADO]" in tags:
        risk = "MEDIO"
    elif "[VERIFICAR_VIGENCIA]" in tags:
        risk = "BAJO"

    return {"tags": tags, "risk": risk, "warnings": warnings}


# ── Detector de templates clonados ────────────────────────────────────────────

def detect_cloned_templates(records: list[dict], field: str) -> list[int]:
    """
    Retorna índices de registros cuyo campo es idéntico al de otros.
    Ignora campos vacíos o ausentes (evita falsos positivos por missing data).
    """
    hashes: dict[str, int] = {}
    cloned: set[int] = set()

    for i, rec in enumerate(records):
        val = rec.get(field, "")
        if not val:  # Skip vacíos — no son clones reales
            continue
        h = _text_hash(val)
        if h in hashes:
            cloned.add(i)
            cloned.add(hashes[h])
        else:
            hashes[h] = i

    return list(cloned)


# ── Auditor de archivos KB ─────────────────────────────────────────────────────

def audit_kb_file(filepath: str) -> dict:
    """Audita un archivo .md del knowledge_base y retorna reporte."""
    path = Path(filepath)
    if not path.exists():
        return {"error": f"Archivo no encontrado: {filepath}"}

    content = path.read_text(encoding="utf-8")

    # Extraer fuente del header del archivo
    source_match = re.search(r'>\s*Fuente[^:]*:\s*(.+)', content)
    source = source_match.group(1) if source_match else path.name

    sections = content.split('\n## ')
    section_results = []
    overall_risks = []

    for section in sections:
        if len(section.strip()) < 50:
            continue
        result = validate_block(section, source)
        section_title = section.split('\n')[0][:60]
        section_results.append({
            "section": section_title,
            "tags": result["tags"],
            "risk": result["risk"],
            "warnings": result["warnings"]
        })
        overall_risks.append(result["risk"])

    risk_order = {"CRÍTICO": 4, "ALTO": 3, "MEDIO": 2, "BAJO": 1}
    max_risk = max(overall_risks, key=lambda r: risk_order.get(r, 0)) if overall_risks else "BAJO"

    return {
        "file": path.name,
        "overall_risk": max_risk,
        "sections": section_results,
        "total_sections": len(section_results),
        "flagged_sections": sum(1 for s in section_results if s["risk"] in ["ALTO", "CRÍTICO"])
    }


def audit_kb_directory(kb_path: str) -> None:
    """Audita todos los .md del knowledge_base e imprime reporte."""
    kb = Path(kb_path)
    if not kb.exists():
        print(f"❌ Directorio no encontrado: {kb_path}")
        return

    md_files = list(kb.glob("*.md"))
    print(f"\n{'='*60}")
    print(f"NERV KB QUALITY AUDIT — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"Archivos encontrados: {len(md_files)}")
    print(f"{'='*60}\n")

    results = []
    for f in sorted(md_files):
        r = audit_kb_file(str(f))
        results.append(r)
        risk_emoji = {"BAJO": "✅", "MEDIO": "⚠️", "ALTO": "🔴", "CRÍTICO": "🚨"}.get(r["overall_risk"], "❓")
        print(f"{risk_emoji} [{r['overall_risk']:8}] {r['file']}")
        if r.get("flagged_sections", 0) > 0:
            for s in r["sections"]:
                if s["risk"] in ["ALTO", "CRÍTICO"]:
                    print(f"   └─ {s['section'][:50]}: {', '.join(s['tags'])}")
                    for w in s["warnings"]:
                        print(f"      ⚡ {w}")

    print(f"\n{'─'*60}")
    criticos = sum(1 for r in results if r["overall_risk"] == "CRÍTICO")
    altos    = sum(1 for r in results if r["overall_risk"] == "ALTO")
    medios   = sum(1 for r in results if r["overall_risk"] == "MEDIO")
    bajos    = sum(1 for r in results if r["overall_risk"] == "BAJO")
    print(f"RESUMEN: 🚨 {criticos} críticos | 🔴 {altos} altos | ⚠️ {medios} medios | ✅ {bajos} limpios")
    print(f"{'─'*60}\n")


# ── Pre-ingest gate ────────────────────────────────────────────────────────────

def pre_ingest_gate(content: str, source: str = "", filename: str = "") -> bool:
    """
    Puerta de entrada antes de embedear un documento.
    Retorna True si pasa, False si debe revisarse antes.
    """
    result = validate_block(content, source)
    print(f"\n📋 PRE-INGEST: {filename or 'documento'}")
    print(f"   Riesgo: {result['risk']} | Tags: {', '.join(result['tags'])}")
    for w in result["warnings"]:
        print(f"   ⚡ {w}")

    if result["risk"] in ["CRÍTICO", "ALTO"]:
        print(f"   ❌ BLOQUEADO — revisar antes de ingestar\n")
        return False

    print(f"   ✅ APROBADO para ingesta\n")
    return True


# ── JSON template detector ─────────────────────────────────────────────────────

def audit_json_file(filepath: str, check_fields: list[str] | None = None) -> dict:
    """Audita un JSON de empresas buscando templates clonados."""
    if check_fields is None:
        check_fields = ["killer_argument", "strategic_hook", "uvp"]

    path = Path(filepath)
    if not path.exists():
        return {"error": f"No encontrado: {filepath}"}

    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    records = [r for r in data if isinstance(r, dict) and "_metadata" not in r]
    report: dict = {"file": path.name, "total_records": len(records), "cloned_fields": {}}

    for field in check_fields:
        cloned_indices = detect_cloned_templates(records, field)
        if cloned_indices:
            report["cloned_fields"][field] = {
                "cloned_count": len(cloned_indices),
                "pct_cloned": round(len(cloned_indices) / len(records) * 100, 1),
                "sample_names": [records[i].get("nombre", f"idx_{i}") for i in cloned_indices[:5]]
            }

    report["overall_risk"] = "CRÍTICO" if report["cloned_fields"] else "BAJO"
    return report


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    KB_PATH = os.path.join(os.path.dirname(__file__), "..", "nexus-poc", "knowledge_base")

    if len(sys.argv) > 1 and sys.argv[1] == "json":
        json_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(KB_PATH, "casinos_latam_185.json")
        result = audit_json_file(json_path)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        audit_kb_directory(KB_PATH)
