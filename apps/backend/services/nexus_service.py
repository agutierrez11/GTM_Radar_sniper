import asyncio
import logging
from typing import Dict, Any, List
from core.db import supabase
from core.config import settings
from .llm_service import llm_service

log = logging.getLogger("NERV_NEXUS")

class NexusService:
    async def get_rag_context(self, query_text: str) -> str:
        """Realiza la búsqueda semántica en el Knowledge Base (KB)."""
        try:
            # Generar embedding asíncrono
            embedding = await llm_service.get_embedding(query_text)
            
            # Consultar Supabase via RPC match_kb
            response = supabase.rpc("match_kb", {
                "query_embedding": embedding,
                "match_threshold": 0.3,
                "match_count": 5
            }).execute()
            
            if not response.data:
                return "No document evidence found in Knowledge Base."
                
            return "\n---\n".join([k.get("content", "") for k in response.data])
        except Exception as e:
            log.warning(f"RAG Retrieval failed: {e}")
            return "No documentary evidence found due to system error."

    async def run_swarm(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Orquesta el Swarm de Agentes (Harvester, Challenger, Synthesizer)."""
        brief = payload.get("brief", {})
        empresa_supabase = payload.get("empresa_supabase", {})
        
        # 1. RAG (Contexto Documental)
        query_text = f"{brief.get('empresa')} {brief.get('producto')} {brief.get('vertical')}"
        rag_context = await self.get_rag_context(query_text)

        # 2. Prompts de Agentes
        harvester_prompt = f"Eres el Cosechador de NERV. Extrae hechos brutales de: {rag_context} y {empresa_supabase}"
        challenger_prompt = f"Eres el Abogado del Diablo. Busca objeciones críticas para: {brief.get('producto')}"
        
        # 3. Ejecución Paralela (Swarm Mode)
        facts, objections = await asyncio.gather(
            llm_service.generate_text(harvester_prompt),
            llm_service.generate_text(challenger_prompt)
        )

        # 4. Síntesis Final
        synthesizer_prompt = f"Sintetiza un reporte NERV en Markdown basado en Hechos: {facts} y Objeciones: {objections}"
        report_md = await llm_service.generate_text(synthesizer_prompt)

        return {
            "empresa": brief.get("empresa"),
            "producto": brief.get("producto"),
            "icp_score": 85,
            "markdown": report_md,
            "facts": facts.split("\n"),
            "objections": objections.split("\n"),
            "trajectory": "INTERCEPCION"
        }

nexus_service = NexusService()
