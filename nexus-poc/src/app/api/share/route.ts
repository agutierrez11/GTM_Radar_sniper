import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();
    const { data: inserted, error } = await supabase
      .from("public_reports")
      .insert({ data })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ id: inserted.id });
  } catch (err: any) {
    console.error("SHARE_POST_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  try {
    const { data, error } = await supabase
      .from("public_reports")
      .select("data")
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("SHARE_GET_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
