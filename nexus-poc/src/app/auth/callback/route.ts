import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Supabase Auth callback handler.
 * Supabase redirige aquí después de que el usuario hace clic en el enlace mágico.
 * Intercambia el `code` de un solo uso por una sesión activa.
 *
 * Configurar en Supabase Dashboard → Authentication → URL Configuration:
 *   Site URL: https://nexus-poc-woad.vercel.app
 *   Redirect URLs: https://nexus-poc-woad.vercel.app/auth/callback
 *                  http://localhost:3000/auth/callback  (para desarrollo local)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[AUTH CALLBACK] Error exchanging code:", error.message);
  }

  // Si falla, redirigir al login con error visible
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
