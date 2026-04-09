import asyncio
import aiohttp
import logging
from typing import List, Optional

from core.config import settings

log = logging.getLogger("NERV_LLM")


def _gemini_model_order(preferred: Optional[str] = None) -> List[str]:
    """Orden: primario (env) + fallbacks; sin duplicados. Gemini 2.x deprecado para cuentas nuevas."""
    primary = settings.GEMINI_MODEL_PRIMARY
    fallbacks = [
        x.strip()
        for x in settings.GEMINI_MODEL_FALLBACKS.split(",")
        if x.strip()
    ]
    base = [primary] + [m for m in fallbacks if m != primary]
    seen: set[str] = set()
    out: List[str] = []
    for m in ([preferred] + base) if preferred else base:
        if m and m not in seen:
            seen.add(m)
            out.append(m)
    return out


class GeminiQuotaError(Exception):
    """Cuota o rate limit de Google Generative Language (p. ej. free tier agotado)."""


class GeminiUnavailableError(Exception):
    """503 u overload temporal — reintenta con otro modelo o más tarde."""


class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.gemini_keys = [
            settings.GEMINI_API_KEY_1,
            settings.GEMINI_API_KEY_2,
            settings.GEMINI_API_KEY_3,
        ]
        self.gemini_keys = [k for k in self.gemini_keys if k]
        self.current_key_index = 0

    def _get_gemini_key(self) -> str:
        if not self.gemini_keys:
            raise ValueError("No GEMINI_API_KEY found.")
        key = self.gemini_keys[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.gemini_keys)
        return key

    async def _gemini_embed(self, text: str) -> List[float]:
        key = self._get_gemini_key()
        em = settings.GEMINI_EMBEDDING_MODEL
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{em}:embedContent?key={key}"
        payload = {
            "model": f"models/{em}",
            "content": {"parts": [{"text": text}]},
            "taskType": "RETRIEVAL_QUERY",
            "outputDimensionality": 768,
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["embedding"]["values"]
                if response.status in (429, 503, 404):
                    raise GeminiUnavailableError(f"Gemini Embed Err: {response.status}")
                raise Exception(f"Gemini Embed Err: {response.status}")

    async def _gemini_generate(self, prompt: str, model: str) -> str:
        key = self._get_gemini_key()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=120)) as response:
                if response.status == 200:
                    data = await response.json()
                    try:
                        return data["candidates"][0]["content"]["parts"][0]["text"]
                    except (KeyError, IndexError, TypeError) as e:
                        log.error("Gemini generate sin candidates: %s", data)
                        raise Exception(
                            f"Gemini respuesta vacía o bloqueada: {data.get('promptFeedback', data)}"
                        ) from e
                body = await response.text()
                err = f"Gemini Generate Err: {response.status} {body[:800]}"
                if response.status == 429:
                    raise GeminiQuotaError(err)
                if response.status in (503, 404):
                    # 404 = modelo deprecado o no habilitado para la cuenta; rotar al siguiente
                    raise GeminiUnavailableError(err)
                raise Exception(err)

    async def _ollama_embed(self, text: str) -> List[float]:
        url = f"{settings.OLLAMA_BASE_URL}/api/embeddings"
        payload = {"model": settings.OLLAMA_EMBED_MODEL, "prompt": text}
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["embedding"]
                raise Exception(f"Ollama Embed Err: {response.status}")

    async def _ollama_generate(self, prompt: str) -> str:
        url = f"{settings.OLLAMA_BASE_URL}/api/generate"
        payload = {"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False}
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=60) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["response"]
                raise Exception(f"Ollama Generate Err: {response.status}")

    async def get_embedding(self, text: str) -> List[float]:
        if self.provider == "ollama":
            return await self._ollama_embed(text)
        last: Optional[Exception] = None
        for attempt in range(3):
            try:
                return await self._gemini_embed(text)
            except GeminiUnavailableError as e:
                last = e
                log.warning("Gemini embed 429/503 intento %s/3, esperando…", attempt + 1)
                await asyncio.sleep(1.5 * (attempt + 1))
        if last:
            raise last
        raise RuntimeError("get_embedding: falló tras reintentos")

    async def generate_text(self, prompt: str, model: Optional[str] = None) -> str:
        if self.provider == "ollama":
            return await self._ollama_generate(prompt)
        models_to_try = _gemini_model_order(preferred=model)
        last: Optional[Exception] = None
        for m in models_to_try:
            try:
                return await self._gemini_generate(prompt, m)
            except (GeminiQuotaError, GeminiUnavailableError) as e:
                last = e
                log.warning("Gemini modelo %s no disponible o cuota: %s — siguiente modelo…", m, e)
                continue
        if last:
            raise last
        raise RuntimeError("generate_text: sin modelos que intentar")


llm_service = LLMService()
