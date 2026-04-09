"""
sincronizar_palacio_memoria.py
NERV — Sincroniza vault Obsidian → Supabase mempalace_nodes + mempalace_connections

USO:
    python engine/sincronizar_palacio_memoria.py
    python engine/sincronizar_palacio_memoria.py --vault ./mi_vault
    python engine/sincronizar_palacio_memoria.py --dry-run

REQUIERE:
    pip install python-frontmatter supabase python-dotenv

TABLAS EN SUPABASE (ejecutar supabase_mempalace.sql primero):
    - mempalace_nodes
    - mempalace_connections
    - función RPC get_node_connections
"""

import os
import re
import sys
import argparse
from pathlib import Path
from datetime import datetime

try:
    import frontmatter
except ImportError:
    print("ERROR: pip install python-frontmatter")
    sys.exit(1)

try:
    from supabase import create_client
except ImportError:
    print("ERROR: pip install supabase")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # Sin dotenv: usa variables de entorno del sistema


# ── Config ────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
DEFAULT_VAULT = Path(__file__).parent.parent / "nexus-poc" / "knowledge_base" / "obsidian"


def get_client():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas")
        print("  En .env o como variables de entorno del sistema")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def extraer_wikilinks(contenido: str) -> list[str]:
    """Extrae todos los [[wikilinks]] del contenido markdown."""
    links = re.findall(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]", contenido)
    # Limpiar: quitar anclas (#) y pipes (|)
    limpios = []
    for link in links:
        link = link.split("#")[0].split("|")[0].strip()
        if link:
            limpios.append(link)
    return list(set(limpios))


def detectar_tipo_nodo(metadata: dict, titulo: str) -> str:
    """Detecta el tipo de nodo desde metadata o por heurística del título."""
    if "tipo" in metadata:
        return metadata["tipo"]
    titulo_lower = titulo.lower()
    if any(p in titulo_lower for p in ["gtm", "mx", "brasil", "colombia", "méxico", "perú", "chile"]):
        return "mercado"
    if any(p in titulo_lower for p in ["fragmentación", "dolor", "abandono", "fraude"]):
        return "nodo_dolor"
    if any(p in titulo_lower for p in ["nerv", "inteligencia", "plataforma", "solución"]):
        return "nodo_solucion"
    if metadata.get("tipo") == "angel_investor" or "investor" in titulo_lower:
        return "persona"
    return "empresa"


def upsert_nodo(supabase, titulo: str, contenido: str, metadata: dict, dry_run: bool) -> int | None:
    """Upsert de un nodo en mempalace_nodes. Retorna el ID."""
    tipo = detectar_tipo_nodo(metadata, titulo)

    data = {
        "title": titulo,
        "content": contenido,
        "node_type": tipo,
        "wing": metadata.get("wing", "latam"),
        "room": metadata.get("vertical", metadata.get("room", "general")),
        "tags": metadata.get("tags", []) or [],
        "dolor": metadata.get("dolor_primario", "").replace("[[", "").replace("]]", "") or None,
        "debilidad": metadata.get("debilidad", None),
        "victoria": metadata.get("victoria_estrategica", "").replace("[[", "").replace("]]", "") or None,
        "solucion": metadata.get("solucion_clave", "").replace("[[", "").replace("]]", "") or None,
        "fuente": "obsidian_vault",
        "confianza": "VERIFICADO",
    }

    if dry_run:
        print(f"  [DRY-RUN] Upsert nodo: '{titulo}' (tipo: {tipo})")
        return None

    try:
        # Intentar actualizar primero (por título único)
        existing = supabase.table("mempalace_nodes").select("id").eq("title", titulo).maybeSingle().execute()

        if existing.data:
            node_id = existing.data["id"]
            supabase.table("mempalace_nodes").update(data).eq("id", node_id).execute()
            return node_id
        else:
            res = supabase.table("mempalace_nodes").insert(data).execute()
            return res.data[0]["id"]
    except Exception as e:
        print(f"  ERROR upsert '{titulo}': {e}")
        return None


def upsert_nodo_placeholder(supabase, titulo: str, dry_run: bool) -> int | None:
    """Crea un nodo vacío para wikilinks que apuntan a fichas no creadas aún."""
    if dry_run:
        print(f"  [DRY-RUN] Placeholder nodo: '{titulo}'")
        return None
    try:
        existing = supabase.table("mempalace_nodes").select("id").eq("title", titulo).maybeSingle().execute()
        if existing.data:
            return existing.data["id"]
        res = supabase.table("mempalace_nodes").insert({
            "title": titulo,
            "content": f"# {titulo}\n\n_Nodo pendiente de desarrollo_",
            "node_type": "placeholder",
            "fuente": "wikilink_auto",
            "confianza": "NO_VERIFICADO",
        }).execute()
        return res.data[0]["id"]
    except Exception as e:
        print(f"  ERROR placeholder '{titulo}': {e}")
        return None


def upsert_conexion(supabase, origen_id: int, destino_id: int, tipo: str, dry_run: bool):
    """Crea o actualiza una conexión entre dos nodos."""
    if dry_run:
        return
    try:
        existing = supabase.table("mempalace_connections")\
            .select("id")\
            .eq("source_node_id", origen_id)\
            .eq("target_node_id", destino_id)\
            .maybeSingle().execute()

        if not existing.data:
            supabase.table("mempalace_connections").insert({
                "source_node_id": origen_id,
                "target_node_id": destino_id,
                "connection_type": tipo,
                "context_of_mention": "wikilink_obsidian",
                "strength": 0.7,
            }).execute()
    except Exception as e:
        print(f"  ERROR conexión {origen_id}→{destino_id}: {e}")


def sincronizar(vault_path: Path, dry_run: bool = False):
    """Proceso principal: lee vault → upsert nodos → mapea conexiones."""
    print(f"\n🛰️  NERV — Sincronizador MemPalace")
    print(f"📁  Vault: {vault_path}")
    print(f"{'🔍  MODO DRY-RUN — sin escrituras' if dry_run else '✍️   MODO REAL — escribiendo en Supabase'}")
    print("-" * 50)

    if not vault_path.exists():
        print(f"ERROR: El vault no existe en {vault_path}")
        sys.exit(1)

    supabase = None if dry_run else get_client()

    archivos_md = list(vault_path.glob("*.md"))
    # Ignorar archivos ocultos y de configuración
    archivos_md = [f for f in archivos_md if not f.name.startswith(".")]

    print(f"📄  {len(archivos_md)} archivos .md encontrados\n")

    # Paso 1: Upsert todos los nodos
    nodo_ids: dict[str, int] = {}  # titulo → id
    wikilinks_pendientes: dict[str, list[str]] = {}  # titulo_origen → [titulos_destino]

    for archivo in sorted(archivos_md):
        titulo = archivo.stem
        print(f"  📝 Procesando: {titulo}")

        try:
            with open(archivo, "r", encoding="utf-8") as f:
                nota = frontmatter.load(f)
        except Exception as e:
            print(f"     ERROR leyendo archivo: {e}")
            continue

        contenido = nota.content
        metadata = dict(nota.metadata)
        links = extraer_wikilinks(contenido)

        print(f"     → {len(links)} wikilinks: {links[:5]}{'...' if len(links) > 5 else ''}")

        node_id = upsert_nodo(supabase, titulo, contenido, metadata, dry_run)
        if node_id:
            nodo_ids[titulo] = node_id

        wikilinks_pendientes[titulo] = links

    print(f"\n✅  {len(nodo_ids)} nodos procesados")

    # Paso 2: Mapear conexiones
    print(f"\n🔗  Mapeando conexiones...")
    conexiones_creadas = 0

    for titulo_origen, links in wikilinks_pendientes.items():
        origen_id = nodo_ids.get(titulo_origen)
        if not origen_id and not dry_run:
            continue

        for titulo_destino in links:
            if titulo_destino == titulo_origen:
                continue  # No autoconexiones

            destino_id = nodo_ids.get(titulo_destino)

            if not destino_id and not dry_run:
                # Crear nodo placeholder para links a fichas no creadas
                destino_id = upsert_nodo_placeholder(supabase, titulo_destino, dry_run)
                if destino_id:
                    nodo_ids[titulo_destino] = destino_id

            if origen_id and destino_id:
                upsert_conexion(supabase, origen_id, destino_id, "ESTRATEGICO", dry_run)
                conexiones_creadas += 1

    print(f"✅  {conexiones_creadas} conexiones mapeadas")

    # Reporte final
    print(f"\n{'─' * 50}")
    print(f"🏁  SINCRONIZACIÓN COMPLETADA")
    print(f"   Nodos:      {len(nodo_ids)}")
    print(f"   Conexiones: {conexiones_creadas}")
    print(f"   Vault:      {vault_path}")
    if not dry_run:
        print(f"   Supabase:   {SUPABASE_URL[:40]}...")
    print(f"{'─' * 50}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sincroniza vault Obsidian → Supabase MemPalace")
    parser.add_argument("--vault", type=Path, default=DEFAULT_VAULT, help="Ruta al vault de Obsidian")
    parser.add_argument("--dry-run", action="store_true", help="Solo mostrar qué haría, sin escribir")
    args = parser.parse_args()

    sincronizar(args.vault, dry_run=args.dry_run)
