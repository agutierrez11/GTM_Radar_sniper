import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";
import { getSupabase } from "./supabase";

// CLIENTE CONFIGURADO PARA DEEPSEEK (Vía Anthropic SDK)
let deepseekClient: Anthropic | null = null;

function getDeepSeekClient() {
  if (!deepseekClient) {
    deepseekClient = new Anthropic({
      apiKey: process.env.DEEPSEEK_API_KEY || "",
      baseURL: "https://api.deepseek.com/anthropic"
    });
  }
  return deepseekClient;
}

export async function generateWithDeepSeek(prompt: string, useReasoner = false) {
  const prompt_hash = crypto.createHash("md5").update(prompt).digest("hex");

  // 1. Check Cache
  const supabaseClient = getSupabase();
  try {
    const { data: cacheEntry } = await supabaseClient
      .from("gemini_cache")
      .select("response, created_at")
      .eq("prompt_hash", prompt_hash)
      .maybeSingle();

    if (cacheEntry) {
      return cacheEntry.response;
    }
  } catch (e) {
    console.error("DeepSeek Cache Error:", e);
  }

  // 2. Call API
  try {
    console.log(`📡 [DEEPSEEK API CALL] Hitting ${useReasoner ? 'R1' : 'V3'} via Anthropic SDK... (Key Mascara: ${process.env.DEEPSEEK_API_KEY?.substring(0, 10)}...)`);
    const deepseek = getDeepSeekClient();
    const message = await deepseek.messages.create({
      model: useReasoner ? "deepseek-reasoner" : "deepseek-chat",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });
    console.log(`✅ [DEEPSEEK API SUCCESS] Response received from DeepSeek.`);

    const responseText = message.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('\n');

    if (responseText) {
      // Attempt to parse JSON if model returns it
      let parsedResponse: any = responseText;
      try {
        // Remove <think> blocks if present (DeepSeek R1 specific)
        const cleanResult = responseText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        const jsonMatch = cleanResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = cleanResult;
        }
      } catch (e) {
        // Keep as string if not valid JSON
      }

      // 3. Save
      await supabaseClient.from("gemini_cache").upsert({
        prompt: prompt.substring(0, 1000),
        prompt_hash,
        response: parsedResponse,
        model: useReasoner ? "deepseek-r1" : "deepseek-v3"
      });

      return parsedResponse;
    }
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    throw error;
  }
}
