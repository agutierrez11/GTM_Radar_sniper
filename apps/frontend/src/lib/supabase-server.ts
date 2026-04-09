import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client para Server Components, Route Handlers y middleware.
 * Usa @supabase/ssr para manejar cookies correctamente en Next.js App Router.
 * En Next.js 15, cookies() es async — esta función debe ser llamada con await.
 * NO usar en "use client" — ahí usar @/lib/supabase (createBrowserClient + cookies).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorar cuando se llama desde Server Component (read-only context).
          }
        },
      },
    }
  );
}
