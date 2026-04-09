from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime

class EmpresaBase(BaseModel):
    # Identity
    nombre: str
    website: str
    pais_hq: Optional[str] = None
    mercados_latam: Optional[List[str]] = None
    ano_fundacion: Optional[int] = None

    # Funding & Scale
    etapa_funding: Optional[str] = None
    total_raised_usd: Optional[int] = None
    empleados_aprox: Optional[str] = None
    tier: Optional[str] = None
    tier_razon: Optional[str] = None

    # Product
    vertical: Optional[str] = None
    modelo_negocio: Optional[str] = None
    plataforma: Optional[Dict[str, Any]] = None
    productos_destacados: Optional[Dict[str, Any]] = None
    modulos: Optional[List[str]] = None
    casos_de_uso: Optional[Dict[str, Any]] = None
    industrias_objetivo: Optional[List[str]] = None
    core: Optional[str] = None
    uvp: Optional[str] = None

    # GTM Intelligence (NERV Differentiators)
    strategic_hook: Optional[str] = None
    pain_1_conversion: Optional[str] = None
    pain_2_compliance: Optional[str] = None
    pain_3_fraude: Optional[str] = None
    competidor_1: Optional[str] = None
    competidor_2: Optional[str] = None
    competidor_3: Optional[str] = None
    killer_argument: Optional[str] = None
    cliente_ideal: Optional[str] = None
    clientes_actuales: Optional[str] = None
    ticket_promedio_usd: Optional[str] = None
    framework_venta: Optional[str] = None
    strategic_notes: Optional[str] = None

    # Market Signals
    signal_context: Optional[str] = None

    # Embeddings
    embedding_text: Optional[str] = None
    embedding_model: str = "gemini-embedding-001"

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaResponse(EmpresaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SemanticSearchRequest(BaseModel):
    query: str
    match_threshold: float = 0.7
    match_count: int = 10
    filter_pais: Optional[str] = None
    filter_tier: Optional[str] = None
    filter_vertical: Optional[str] = None

class SearchResult(BaseModel):
    id: int
    nombre: str
    website: str
    pais_hq: Optional[str]
    vertical: Optional[str]
    tier: Optional[str]
    strategic_hook: Optional[str]
    pain_1_conversion: Optional[str]
    killer_argument: Optional[str]
    framework_venta: Optional[str]
    signal_context: Optional[str]
    uvp: Optional[str]
    similarity: float
