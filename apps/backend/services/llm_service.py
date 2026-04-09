import aiohttp
import logging
from typing import List, Optional, Dict, Any
from core.config import settings

log = logging.getLogger("NERV_LLM")

class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.gemini_keys = [
            settings.GEMINI_API_KEY_1,
            settings.GEMINI_API_KEY_2,
            settings.GEMINI_API_KEY_3
        ]
        self.gemini_keys = [k for k in self.gemini_keys if k]
        self.current_key_index = 0

    def _get_gemini_key(self) -> str:
        if not self.gemini_keys:
            raise ValueError("No GEMINI_API_KEY found.")
        key = self.gemini_keys[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.gemini_keys)
        return key

    # --- GEMINI METHODS ---
    async def _gemini_embed(self, text: str) -> List[float]:
        key = self._get_gemini_key()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={key}"
        payload = {
            "model": "models/gemini-embedding-001",
            "content": {"parts": [{"text": text}]},
            "taskType": "RETRIEVAL_QUERY"
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["embedding"]["values"]
                raise Exception(f"Gemini Embed Err: {response.status}")

    async def _gemini_generate(self, prompt: str, model: str) -> str:
        key = self._get_gemini_key()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=30) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                raise Exception(f"Gemini Generate Err: {response.status}")

    # --- OLLAMA METHODS ---
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

    # --- PUBLIC API ---
    async def get_embedding(self, text: str) -> List[float]:
        if self.provider == "ollama":
            return await self._ollama_embed(text)
        return await self._gemini_embed(text)

    async def generate_text(self, prompt: str, model: str = "gemini-2.0-flash") -> str:
        if self.provider == "ollama":
            return await self._ollama_generate(prompt)
        return await self._gemini_generate(prompt, model)

llm_service = LLMService()
