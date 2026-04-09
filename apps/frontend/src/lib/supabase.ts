import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials missing! Using dummy values for build.");
}

/**
 * Cliente de navegador con cookies (App Router + middleware).
 * createClient de supabase-js guardaba sesión en localStorage → el middleware no veía al usuario.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
