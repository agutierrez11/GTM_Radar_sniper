import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente solo para /api/discovery (Route Handler).
 * Usa service role si existe en runtime para leer empresas_v3 con RLS restrictivo.
 */
function createDiscoveryClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, service || anon);
}

export const supabaseDiscovery = createDiscoveryClient();
