import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    env: {
      GOOGLE_APIS_PAUSED: process.env.GOOGLE_APIS_PAUSED || "NOT SET",
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? `SET (${process.env.ANTHROPIC_API_KEY.slice(0,10)}...)` : "NOT SET",
      GROQ_API_KEY: process.env.GROQ_API_KEY ? `SET (${process.env.GROQ_API_KEY.slice(0,8)}...)` : "NOT SET",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET",
    }
  });
}
