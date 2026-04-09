import os
from dotenv import load_dotenv

# Cargar variables de entorno desde la raíz del proyecto o el directorio local
load_dotenv()

class Settings:
    PROJECT_NAME: str = "NERV API"
    VERSION: str = "1.0.0"
    
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini") # "gemini" o "ollama"
    
    # Ollama Configuration
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3")
    OLLAMA_EMBED_MODEL: str = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
    
    # AI Keys (Gemini) — el LLM solo lee _1/_2/_3; GEMINI_API_KEY (sin sufijo) es fallback si _1 vacío
    _GEMINI_FALLBACK: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_API_KEY_1: str = os.getenv("GEMINI_API_KEY_1", "") or _GEMINI_FALLBACK
    GEMINI_API_KEY_2: str = os.getenv("GEMINI_API_KEY_2", "") or _GEMINI_FALLBACK
    GEMINI_API_KEY_3: str = os.getenv("GEMINI_API_KEY_3", "") or _GEMINI_FALLBACK

    # Embeddings (REST v1beta). Cuota GCP suele mostrar "gemini-embedding-1.0"; el id de API suele ser gemini-embedding-001.
    GEMINI_EMBEDDING_MODEL: str = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")

    # Generación: familia Gemini 3 (Google AI). Fallbacks separados por coma.
    GEMINI_MODEL_PRIMARY: str = os.getenv("GEMINI_MODEL_PRIMARY", "gemini-3-flash-preview")
    # Comma-separated; típico: gemini-3.1-flash-lite-preview, gemini-2.5-flash
    GEMINI_MODEL_FALLBACKS: str = os.getenv(
        "GEMINI_MODEL_FALLBACKS",
        "gemini-3.1-flash-lite-preview,gemini-2.5-flash",
    )
    
    # Scraping & Signals
    FIRECRAWL_API_KEY: str = os.getenv("FIRECRAWL_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

settings = Settings()
