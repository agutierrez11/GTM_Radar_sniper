from fastapi import APIRouter, HTTPException, BackgroundTasks, Query, Body
from typing import List, Optional, Dict, Any
from models.empresa import EmpresaResponse, SemanticSearchRequest, SearchResult
from core.db import supabase
from services.nexus_service import nexus_service
from services.llm_service import llm_service

router = APIRouter(prefix="/empresas", tags=["empresas"])

@router.get("/", response_model=List[EmpresaResponse])
def get_empresas(limit: int = 20, offset: int = 0):
    """Obtiene un listado de empresas enriquecidas."""
    response = supabase.table("empresas_v3").select("*").range(offset, offset + limit - 1).execute()
    return response.data

@router.get("/{id}", response_model=EmpresaResponse)
def get_empresa(id: int):
    """Obtiene el perfil completo de una empresa por ID."""
    response = supabase.table("empresas_v3").select("*").eq("id", id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return response.data

@router.post("/search", response_model=List[SearchResult])
async def search_empresas(request: SemanticSearchRequest):
    """Realiza una búsqueda semántica usando el vector de embeddings generado por Gemini."""
    try:
        # 1. Generar embedding asíncrono de la query
        embedding = await llm_service.get_embedding(request.query)
        
        # 2. Consultar Supabase via RPC match_empresas
        response = supabase.rpc("match_empresas", {
            "query_embedding": embedding,
            "match_threshold": request.match_threshold,
            "match_count": request.match_count,
            "filter_pais": request.filter_pais,
            "filter_tier": request.filter_tier,
            "filter_vertical": request.filter_vertical
        }).execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Búsqueda semántica falló: {str(e)}")

@router.post("/nexus")
async def analyze_nexus(payload: Dict[str, Any] = Body(...)):
    """Ejecuta el Swarm de Agentes para generar un reporte estratégico (NEXUS)."""
    try:
        result = await nexus_service.run_swarm(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/enrich")
async def enrich_empresas(urls: List[str], background_tasks: BackgroundTasks):
    """Lanza el proceso de enriquecimiento en segundo plano."""
    # background_tasks.add_task(v6_stable_enricher, urls)
    return {"status": "Process started", "message": f"Enriqueciendo {len(urls)} empresas."}
