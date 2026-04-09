import { createClient } from "@supabase/supabase-js";

// Táctica de Túnel: Evitar mismatch de hidratación y asegurar conectividad
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const getSupabaseUrl = () => {
  // Si estamos en el navegador, usamos el proxy relativo para que pase por el túnel
  if (typeof window !== 'undefined') {
    return "/supabase-api";
  }
  // Si estamos en el servidor (SSR/Build), usamos la URL interna de Docker
  // Esto permite que el servidor de Next.js hable directo con Supabase
  return "http://host.docker.internal:54321";
};

// Exportamos una función para obtener el cliente y evitar problemas de inicialización estática
export const supabase = createClient(getSupabaseUrl(), supabaseAnonKey);
