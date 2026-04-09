import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Diagnóstico de env vars y conectividad — NO expone valores, solo presencia.
 */
export async function GET() {
  const vars = {
    // Google / Gemini
    GEMINI_API_KEY_PROFESSIONAL: !!process.env.GEMINI_API_KEY_PROFESSIONAL,
    GEMINI_API_KEY_1:            !!process.env.GEMINI_API_KEY_1,
    GOOGLE_APIS_PAUSED:          process.env.GOOGLE_APIS_PAUSED ?? "not set",

    // LLM Fallbacks
    ANTHROPIC_API_KEY:   !!process.env.ANTHROPIC_API_KEY,
    OPENROUTER_API_KEY:  !!process.env.OPENROUTER_API_KEY,
    GROQ_API_KEY:        !!process.env.GROQ_API_KEY,

    // Observability
    GALILEO_API_KEY:      !!process.env.GALILEO_API_KEY,
    GALILEO_CONSOLE_URL:  process.env.GALILEO_CONSOLE_URL ?? "not set",

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL:      !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY:     !!process.env.SUPABASE_SERVICE_ROLE_KEY,

    // App
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE ?? "not set",
  };

  // Quick smoke-test: Gemini (solo si no está pausado)
  const tests: Record<string, string> = {};

  if (process.env.GOOGLE_APIS_PAUSED !== "true" && process.env.GEMINI_API_KEY_PROFESSIONAL) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_PROFESSIONAL);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      await model.generateContent("ping");
      tests.gemini = "OK";
    } catch (e: any) {
      tests.gemini = `FAIL: ${e?.status ?? e?.message}`;
    }
  } else {
    tests.gemini = "SKIPPED (paused or no key)";
  }

  // Quick smoke-test: Claude
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 10,
        messages: [{ role: "user", content: "ping" }],
      });
      tests.claude = "OK";
    } catch (e: any) {
      tests.claude = `FAIL: ${e?.status ?? e?.message}`;
    }
  } else {
    tests.claude = "SKIPPED (no key)";
  }

  // Quick smoke-test: OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nerv.app",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-haiku",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 5,
        }),
      });
      tests.openrouter = res.ok ? "OK" : `FAIL: HTTP ${res.status}`;
    } catch (e: any) {
      tests.openrouter = `FAIL: ${e?.message}`;
    }
  } else {
    tests.openrouter = "SKIPPED (no key)";
  }

  return NextResponse.json({ vars, tests, ts: new Date().toISOString() });
}
