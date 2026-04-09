import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/metrics
 * Métricas internas de uso de NERV.
 * Protegido por header x-admin-token.
 *
 * Uso:
 *   curl https://nexus-poc-woad.vercel.app/api/admin/metrics \
 *     -H "x-admin-token: TU_TOKEN_SECRETO"
 */
export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token || token !== process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [runsResult, last7Result, recentEmpresas, userRows] = await Promise.all([
      adminClient.from("usage_logs").select("id", { count: "exact", head: true }),
      adminClient
        .from("usage_logs")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 86_400_000).toISOString()),
      adminClient
        .from("usage_logs")
        .select("empresa, user_email, tier, icp_score, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      adminClient
        .from("usage_logs")
        .select("user_email"),
    ]);

    const uniqueUsers = new Set(
      (userRows.data ?? []).map((r: { user_email: string }) => r.user_email)
    ).size;

    const topEmpresas: Record<string, number> = {};
    for (const row of recentEmpresas.data ?? []) {
      topEmpresas[row.empresa] = (topEmpresas[row.empresa] ?? 0) + 1;
    }

    return NextResponse.json({
      total_runs: runsResult.count ?? 0,
      unique_users: uniqueUsers,
      runs_last_7_days: last7Result.count ?? 0,
      recent_analyses: recentEmpresas.data ?? [],
      top_empresas: Object.entries(topEmpresas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([empresa, count]) => ({ empresa, count })),
    });
  } catch (err: any) {
    console.error("[ADMIN METRICS ERROR]", err?.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
