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
    
    # Feature Flags
    FEATURE_RAG_ENABLED: bool = os.getenv("FEATURE_RAG_ENABLED", "true").lower() == "true"
    FEATURE_ENRICHMENT_ENABLED: bool = os.getenv("FEATURE_ENRICHMENT_ENABLED", "false").lower() == "true"
    
    # AI Keys (Gemini)
    GEMINI_API_KEY_1: str = os.getenv("GEMINI_API_KEY_1", "")
    GEMINI_API_KEY_2: str = os.getenv("GEMINI_API_KEY_2", "")
    GEMINI_API_KEY_3: str = os.getenv("GEMINI_API_KEY_3", "")
    
    # Scraping & Signals
    FIRECRAWL_API_KEY: str = os.getenv("FIRECRAWL_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

settings = Settings()
