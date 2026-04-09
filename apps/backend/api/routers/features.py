from fastapi import APIRouter
from core.config import settings

router = APIRouter(prefix="/features", tags=["features"])

@router.get("/")
async def get_feature_flags():
    """Devuelve el estado actual de las Feature Flags del sistema."""
    return {
        "rag_enabled": settings.FEATURE_RAG_ENABLED,
        "enrichment_enabled": settings.FEATURE_ENRICHMENT_ENABLED,
        "provider": settings.LLM_PROVIDER
    }
