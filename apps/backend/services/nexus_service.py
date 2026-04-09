import asyncio
import json
import logging
import re
from typing import Any, Dict, List

from core.db import supabase
from .llm_service import llm_service

log = logging.getLogger("NERV_NEXUS")


def _parse_json_llm(text: str) -> Dict[str, Any]:
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```(?:json)?\s*", "", t, flags=re.IGNORECASE | re.MULTILINE)
        t = re.sub(r"\s*```\s*$", "", t)
    t = t.strip()
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        a, b = t.find("{"), t.rfind("}")
        if a >= 0 and b > a:
            return json.loads(t[a : b + 1])
        raise


def _clamp_icp(v: Any) -> int:
    try:
        n = int(float(v))
    except (TypeError, ValueError):
        return 75
    return max(0, min(100, n))


def _norm_tier(v: Any) -> str:
    s = re.sub(r"\s+", "", str(v or "Tier2"))
    if s in ("Tier1", "Tier2", "Tier3"):
        return s
    return "Tier2"


def _norm_conf(v: Any) -> str:
    s = str(v or "MEDIA").strip().upper()
    if s in ("ALTA", "MEDIA", "BAJA"):
        return s
    return "MEDIA"


class NexusService:
    async def get_rag_context(self, query_text: str) -> str:
        """Realiza la búsqueda semántica en el Knowledge Base (KB)."""
        try:
            embedding = await llm_service.get_embedding(query_text)

            response = supabase.rpc(
                "match_kb",
                {
                    "query_embedding": embedding,
                    "match_threshold": 0.3,
                    "match_count": 5,
                },
            ).execute()

            if not response.data:
                return "No document evidence found in Knowledge Base."

            return "\n---\n".join([k.get("content", "") for k in response.data])
        except Exception as e:
            log.exception("RAG Retrieval failed (no se oculta el error)")
            raise

    async def run_swarm(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Orquesta el Swarm (Harvester, Challenger, Sintetizador JSON para UI NervForm)."""
        brief = payload.get("brief") or {}
        empresa_supabase = payload.get("empresa_supabase") or {}
        benchmark = payload.get("benchmark") or []
        competidores_payload = payload.get("competidores") or []
        clientes_potenciales = payload.get("clientes_potenciales") or []

        similares: List[str] = []
        for b in benchmark:
            if isinstance(b, dict) and b.get("empresa_similar"):
                similares.append(str(b["empresa_similar"]))

        query_text = f"{brief.get('empresa')} {brief.get('producto')} {brief.get('vertical')}"
        rag_context = await self.get_rag_context(query_text)

        brief_json = json.dumps(brief, ensure_ascii=False)
        empresa_json = json.dumps(
            {k: empresa_supabase.get(k) for k in list(empresa_supabase.keys())[:40]},
            ensure_ascii=False,
        )

        harvester_prompt = (
            "Eres el Cosechador NERV. Extrae hechos accionables y citables (no marketing genérico) "
            f"a partir del contexto KB y datos de empresa.\n\n"
            f"KB y contexto:\n{rag_context[:12000]}\n\nDatos empresa (JSON):\n{empresa_json}\n"
        )
        challenger_prompt = (
            "Eres el Abogado del Diablo NERV. Lista objeciones y riesgos concretos para vender "
            f"el producto al buyer indicado, no halagos.\n\nBrief (JSON):\n{brief_json}\n"
        )

        facts, objections = await asyncio.gather(
            llm_service.generate_text(harvester_prompt),
            llm_service.generate_text(challenger_prompt),
        )

        structured_prompt = f"""Eres el Sintetizador NERV. Devuelve ÚNICAMENTE un objeto JSON válido (sin markdown fence, sin texto fuera del JSON) con EXACTAMENTE esta forma (claves en español donde aplica):

{{
  "icp_score": <entero 0-100>,
  "tier": "Tier1" | "Tier2" | "Tier3",
  "latido_mercado": "<una frase: señal de mercado o timing para este target>",
  "analisis_forense": {{
    "inferencia_raise": "<hipótesis forense deducida, 2-4 oraciones>",
    "friccion_tecnica": "<fricción técnica/operativa plausible>",
    "dolor_financiero": "<dolor financiero / riesgo / compliance>"
  }},
  "diagnostico": {{
    "friccion_operativa": "<string>",
    "dolor_critico": "<string>",
    "resolucion_tactica": "<string>"
  }},
  "plan_ataque": {{
    "schwerpunkt": "<foco principal de venta>",
    "flanqueo": "<ángulo alternativo / wedge>",
    "apertura": "<mensaje de apertura listo para copiar, 2-4 oraciones>"
  }},
  "auditoria": {{
    "abogado_diablo": "<resume las objeciones más duras que el comprador podría usar>",
    "sesgo": "<sesgo detectado en el razonamiento o 'Ninguno significativo'>",
    "confianza": "ALTA" | "MEDIA" | "BAJA"
  }},
  "evidencia": [ "<opcional: 2-5 bullets con referencias a hechos del KB, sin inventar URLs>" ],
  "markdown": "<informe ejecutivo en Markdown: resumen, ICP, dolores, plan, riesgos; 600-2000 palabras>"
}}

Brief GTM (JSON):
{brief_json}

Hechos cosechados:
{facts}
Objeciones:
{objections}

Contexto KB (puede estar truncado):
{rag_context[:10000]}
"""

        raw = await llm_service.generate_text(structured_prompt)
        try:
            data = _parse_json_llm(raw)
        except Exception as e:
            log.exception("Síntesis NERV: JSON inválido")
            raise ValueError(
                f"Síntesis NERV no devolvió JSON válido: {e!s}"
            ) from e

        af = data.get("analisis_forense") if isinstance(data.get("analisis_forense"), dict) else {}
        dg = data.get("diagnostico") if isinstance(data.get("diagnostico"), dict) else {}
        pa = data.get("plan_ataque") if isinstance(data.get("plan_ataque"), dict) else {}
        au = data.get("auditoria") if isinstance(data.get("auditoria"), dict) else {}

        md = (data.get("markdown") or "").strip()
        if not md:
            md = f"# {brief.get('empresa', 'Target')}\n\n{facts}\n\n{objections}"

        evidencia = data.get("evidencia")
        if evidencia is not None and not isinstance(evidencia, list):
            evidencia = [str(evidencia)]
        elif evidencia is None:
            evidencia = []

        return {
            "empresa": brief.get("empresa"),
            "producto": brief.get("producto"),
            "icp_score": _clamp_icp(data.get("icp_score")),
            "tier": _norm_tier(data.get("tier")),
            "latido_mercado": str(data.get("latido_mercado") or "").strip(),
            "analisis_forense": {
                "inferencia_raise": str(af.get("inferencia_raise") or "").strip(),
                "friccion_tecnica": str(af.get("friccion_tecnica") or "").strip(),
                "dolor_financiero": str(af.get("dolor_financiero") or "").strip(),
            },
            "diagnostico": {
                "friccion_operativa": str(dg.get("friccion_operativa") or "").strip(),
                "dolor_critico": str(dg.get("dolor_critico") or "").strip(),
                "resolucion_tactica": str(dg.get("resolucion_tactica") or "").strip(),
            },
            "plan_ataque": {
                "schwerpunkt": str(pa.get("schwerpunkt") or "").strip(),
                "flanqueo": str(pa.get("flanqueo") or "").strip(),
                "apertura": str(pa.get("apertura") or "").strip(),
            },
            "auditoria": {
                "abogado_diablo": str(au.get("abogado_diablo") or "").strip(),
                "sesgo": str(au.get("sesgo") or "").strip(),
                "confianza": _norm_conf(au.get("confianza")),
            },
            "markdown": md,
            "facts": facts.split("\n"),
            "objections": objections.split("\n"),
            "similares": similares,
            "competidores": competidores_payload,
            "clientes_potenciales": clientes_potenciales,
            "evidencia": [str(x) for x in evidencia if x][:12],
            "trajectory": "INTERCEPCION",
        }


nexus_service = NexusService()
