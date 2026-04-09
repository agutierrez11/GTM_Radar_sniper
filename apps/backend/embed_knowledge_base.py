"""
NERV — KB Embed Pipeline
=========================
Lee archivos .md del knowledge_base/, los valida con kb_quality_layer
y los embeddea en Supabase (tabla knowledge_base).

Uso:
  python embed_knowledge_base.py           # Embeddea todo el KB
  python embed_knowledge_base.py --audit   # Solo audita, no embeddea
  python embed_knowledge_base.py --force   # Embeddea incluso archivos con riesgo ALTO

Requiere en .env:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  GEMINI_API_KEY (para embeddings gemini-embedding-001, 768 dims)
  o OPENAI_API_KEY (para text-embedding-3-small, 1536 dims)
"""

import os
import re
import sys
import json
import time
import logging
import hashlib
import requests
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(__file__))
from kb_quality_layer import pre_ingest_gate, audit_kb_directory

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ── Config ─────────────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_KEY   = os.getenv("GEMINI_API_KEY")
OPENAI_KEY   = os.getenv("OPENAI_API_KEY")

KB_PATH       = os.path.join(os.path.dirname(__file__), "..", "nexus-poc", "knowledge_base")
CHUNK_SIZE    = 1500   # caracteres por chunk
CHUNK_OVERLAP_WORDS = 40   # palabras de overlap entre chunks (unidad: palabras)
EMBED_DIM     = 768    # gemini-embedding-001 — usado para validar dimensión
DELAY         = 0.5    # segundos entre requests al API de embeddings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("KB_EMBED")

# ── Supabase helpers ────────────────────────────────────────────────────────────

def get_headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def chunks_exist_batch(content_hashes: list[str]) -> set[str]:
    """
    Verifica en un solo request qué hashes ya existen en Supabase.
    Evita N+1 queries — un request por archivo en lugar de uno por chunk.
    """
    if not content_hashes:
        return set()
    # PostgREST IN filter via comma-separated values
    hashes_param = ",".join(f'"{h}"' for h in content_hashes)
    url = f"{SUPABASE_URL}/rest/v1/knowledge_base?select=metadata->>content_hash&metadata->>content_hash=in.({hashes_param})"
    try:
        r = requests.get(url, headers=get_headers(), timeout=15)
        if r.status_code == 200:
            return {row.get("content_hash") for row in r.json() if row.get("content_hash")}
    except Exception as e:
        log.error(f"Batch existence check failed: {e}")
    return set()

def upsert_chunk(content: str, metadata: dict, embedding: list[float]) -> bool:
    """Inserta chunk con embedding en Supabase."""
    # Validar dimensión del embedding
    if len(embedding) != EMBED_DIM:
        log.error(f"Embedding dim mismatch: expected {EMBED_DIM}, got {len(embedding)}")
        return False

    url = f"{SUPABASE_URL}/rest/v1/knowledge_base"
    payload = {
        "content": content,
        "metadata": metadata,
        "embedding": embedding,
        "source_url": metadata.get("source_file", ""),
        "created_at": datetime.utcnow().isoformat()
    }
    r = requests.post(url, headers={**get_headers(), "Prefer": "return=minimal"}, json=payload, timeout=20)
    return r.status_code in [200, 201, 204]

# ── Chunking ────────────────────────────────────────────────────────────────────

def chunk_markdown(text: str, source_file: str) -> list[dict]:
    """
    Divide el markdown en chunks semánticos respetando secciones (##).
    Overlap medido en palabras (CHUNK_OVERLAP_WORDS).
    """
    chunks = []
    sections = text.split('\n## ')

    for i, section in enumerate(sections):
        if len(section.strip()) < 50:
            continue

        if len(section) <= CHUNK_SIZE:
            chunks.append({"content": section.strip(), "section_idx": i, "source_file": source_file})
            continue

        # Dividir sección larga en sub-chunks con overlap
        words = section.split()
        current: list[str] = []
        current_len = 0

        for word in words:
            current.append(word)
            current_len += len(word) + 1
            if current_len >= CHUNK_SIZE:
                chunks.append({
                    "content": " ".join(current).strip(),
                    "section_idx": i,
                    "source_file": source_file
                })
                # Mantener overlap medido en palabras, no en chars
                current = current[-CHUNK_OVERLAP_WORDS:]
                current_len = sum(len(w) + 1 for w in current)

        if current:
            chunks.append({
                "content": " ".join(current).strip(),
                "section_idx": i,
                "source_file": source_file
            })

    return chunks

# ── Embeddings ──────────────────────────────────────────────────────────────────

def get_embedding_gemini(text: str) -> list[float] | None:
    """Embedding con Gemini gemini-embedding-001 (768 dims)."""
    if not GEMINI_KEY:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={GEMINI_KEY}"
    payload = {
        "model": "models/gemini-embedding-001",
        "content": {"parts": [{"text": text[:8000]}]},
        "taskType": "RETRIEVAL_DOCUMENT"
    }
    try:
        r = requests.post(url, json=payload, timeout=30)
        if r.status_code == 200:
            return r.json()["embedding"]["values"]
        log.error(f"Gemini embed error: {r.status_code} {r.text[:100]}")
    except Exception as e:
        log.error(f"Gemini embed exception: {e}")
    return None

def get_embedding_openai(text: str) -> list[float] | None:
    """Fallback: OpenAI text-embedding-3-small (1536 dims)."""
    if not OPENAI_KEY:
        return None
    url = "https://api.openai.com/v1/embeddings"
    headers = {"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"}
    payload = {"model": "text-embedding-3-small", "input": text[:8000]}
    try:
        r = requests.post(url, headers=headers, json=payload, timeout=30)
        if r.status_code == 200:
            return r.json()["data"][0]["embedding"]
        log.error(f"OpenAI embed error: {r.status_code}")
    except Exception as e:
        log.error(f"OpenAI embed exception: {e}")
    return None

def get_embedding(text: str) -> list[float] | None:
    """Gemini primero, OpenAI como fallback."""
    return get_embedding_gemini(text) or get_embedding_openai(text)

# ── Pipeline principal ─────────────────────────────────────────────────────────

_SOURCE_PATTERN = re.compile(r'>\s*Fuente[^:]*:\s*(.+)')

def embed_file(filepath: str, force: bool = False) -> dict:
    """
    Procesa un archivo .md:
    1. Valida con quality gate
    2. Chunking
    3. Batch-check existencia en Supabase
    4. Embed + upsert solo los chunks nuevos

    Retorna stats con clave 'chunks_embedded' (consistente con run_pipeline).
    """
    path = Path(filepath)
    content = path.read_text(encoding="utf-8")

    source_match = _SOURCE_PATTERN.search(content)
    source = source_match.group(1) if source_match else path.name

    # 1. Quality gate
    passed = pre_ingest_gate(content, source, path.name)
    if not passed and not force:
        return {"file": path.name, "status": "BLOCKED", "chunks_embedded": 0, "chunks_skipped": 0}

    # 2. Chunking
    chunks = chunk_markdown(content, path.name)
    log.info(f"Chunked {path.name}: {len(chunks)} chunks")

    # 3. Batch-check existencia (1 request en lugar de N)
    content_hashes = [hashlib.md5(c["content"].encode()).hexdigest() for c in chunks]
    existing_hashes = chunks_exist_batch(content_hashes)
    chunks_skipped = sum(1 for h in content_hashes if h in existing_hashes)

    # 4. Embed + upsert solo los nuevos
    embedded = 0
    for chunk, content_hash in zip(chunks, content_hashes):
        if content_hash in existing_hashes:
            continue

        embedding = get_embedding(chunk["content"])
        if not embedding:
            log.error(f"No embedding for chunk in {path.name}")
            continue

        metadata = {
            "source_file": path.name,
            "section_idx": chunk["section_idx"],
            "content_hash": content_hash,
            "quality_passed": passed,
            "embedded_at": datetime.utcnow().isoformat()
        }

        if upsert_chunk(chunk["content"], metadata, embedding):
            embedded += 1
        else:
            log.error(f"Failed to upsert chunk in {path.name}")

        time.sleep(DELAY)

    return {
        "file": path.name,
        "status": "EMBEDDED" if embedded > 0 else "NO_NEW_CHUNKS",
        "chunks_embedded": embedded,
        "chunks_skipped": chunks_skipped,
        "quality_passed": passed
    }


def run_pipeline(audit_only: bool = False, force: bool = False) -> None:
    kb = Path(KB_PATH)
    if not kb.exists():
        log.error(f"KB path no encontrado: {KB_PATH}")
        return

    md_files = sorted(kb.glob("*.md"))
    log.info(f"Encontrados {len(md_files)} archivos en KB")

    if audit_only:
        audit_kb_directory(KB_PATH)
        return

    results = []
    for f in md_files:
        log.info(f"Procesando: {f.name}")
        result = embed_file(str(f), force=force)
        results.append(result)

    total_embedded = sum(r["chunks_embedded"] for r in results)
    blocked = sum(1 for r in results if r["status"] == "BLOCKED")

    print(f"\n{'='*50}")
    print(f"EMBED PIPELINE COMPLETADO — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*50}")
    print(f"Archivos procesados : {len(results)}")
    print(f"Archivos bloqueados : {blocked} (riesgo ALTO/CRÍTICO)")
    print(f"Chunks embeddeados  : {total_embedded}")
    print(f"{'='*50}\n")

    for r in results:
        icon = "✅" if r["status"] == "EMBEDDED" else "❌" if r["status"] == "BLOCKED" else "⏭"
        print(f"{icon} {r['file']}: {r['status']} ({r['chunks_embedded']} nuevos, {r['chunks_skipped']} ya existían)")


if __name__ == "__main__":
    run_pipeline(
        audit_only="--audit" in sys.argv,
        force="--force" in sys.argv
    )
