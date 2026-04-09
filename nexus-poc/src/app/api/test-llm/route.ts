import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/test-llm
 * Prueba el flujo completo de LLM fallback con un prompt real de NERV.
 * Muestra el error exacto de cada proveedor.
 */
export async function GET() {
  const results: Record<string, any> = {};
  const prompt = `Eres el AGENTE COSECHADOR de NERV. Empresa: Clip, Vertical: Payments, País: México.
Responde ÚNICAMENTE con JSON válido: {"hechos": ["hecho1", "hecho2", "hecho3"]}`;

  // 1. Claude
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const t = Date.now();
      const msg = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      });
      results.claude = { status: "OK", ms: Date.now() - t, preview: (msg.content[0] as any).text?.slice(0, 100) };
    } catch (e: any) {
      results.claude = { status: "FAIL", error: e?.message, statusCode: e?.status };
    }
  } else {
    results.claude = { status: "SKIPPED (no key)" };
  }

  // 2. OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    const orModel = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";
    try {
      const t = Date.now();
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nerv.app",
          "X-Title": "NERV RaiSE",
        },
        body: JSON.stringify({
          model: orModel,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
          temperature: 0.1,
        }),
      });
      const body = await res.json();
      const ms = Date.now() - t;
      if (res.ok) {
        results.openrouter = { status: "OK", model: orModel, ms, preview: body.choices?.[0]?.message?.content?.slice(0, 100) };
      } else {
        results.openrouter = { status: "FAIL", httpStatus: res.status, model: orModel, error: body?.error?.message };
      }
    } catch (e: any) {
      results.openrouter = { status: "FAIL", error: e?.message };
    }
  } else {
    results.openrouter = { status: "SKIPPED (no key)" };
  }

  // 3. Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const t = Date.now();
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
          response_format: { type: "json_object" },
        }),
      });
      const body = await res.json();
      const ms = Date.now() - t;
      if (res.ok) {
        results.groq = { status: "OK", ms, preview: body.choices?.[0]?.message?.content?.slice(0, 100) };
      } else {
        results.groq = { status: "FAIL", httpStatus: res.status, error: body?.error?.message };
      }
    } catch (e: any) {
      results.groq = { status: "FAIL", error: e?.message };
    }
  } else {
    results.groq = { status: "SKIPPED (no key)" };
  }

  return NextResponse.json({ results, ts: new Date().toISOString() });
}
