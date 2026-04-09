import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Service role client para bypasear RLS en inserts de server
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/log-usage
 * Registra cada análisis NERV corrido por un usuario autenticado.
 * La identidad se toma de la sesión server-side — nunca del body del request.
 *
 * Body esperado: { empresa, producto, pais, vertical, tier, icp_score, duration_ms }
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar identidad desde sesión server-side
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { empresa, producto, pais, vertical, tier, icp_score, duration_ms } = body;

    if (!empresa) {
      return NextResponse.json({ error: "empresa is required" }, { status: 400 });
    }

    await adminClient.from("usage_logs").insert({
      user_id: user.id,
      user_email: user.email,
      empresa,
      producto: producto ?? null,
      pais: pais ?? null,
      vertical: vertical ?? null,
      tier: tier ?? null,
      icp_score: typeof icp_score === "number" ? icp_score : null,
      duration_ms: typeof duration_ms === "number" ? duration_ms : null,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // No bloqueamos al usuario si el log falla — solo registramos
    console.error("[LOG USAGE ERROR]", err?.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
