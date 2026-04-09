import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de autenticación NERV.
 * Protege /app/* y /advanced/* — redirige a /login si no hay sesión activa.
 * Usa getUser() (verifica JWT con Supabase server) en lugar de getSession()
 * (que solo lee la cookie local y puede ser falsificada).
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: Siempre llamar getUser() para que Supabase refresque
  // el token de sesión si está próximo a expirar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/app") || pathname.startsWith("/advanced");

  // DEMO_MODE: bypass auth para demos sin login
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!user && isProtected && !demoMode) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // DEMO_MODE: si alguien llega a /login, mandarlo directo al app
  if (demoMode && pathname === "/login") {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = "/app";
    return NextResponse.redirect(appUrl);
  }

  // Si ya está autenticado y va a /login, redirigir al app
  if (user && pathname === "/login") {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = "/app";
    return NextResponse.redirect(appUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Excluye archivos estáticos y rutas internas de Next.js
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
