from supabase import create_client, Client
from .config import settings

def get_supabase() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError("SUPABASE_URL y SUPABASE_KEY deben estar configurados en el entorno.")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Cliente singleton para uso en toda la app
supabase: Client = get_supabase()
