import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import { supabase } from './supabase';

let anthropicClient: Anthropic | null = null;

function getAnthropicClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }
  return anthropicClient;
}

function hashPrompt(prompt: string): string {
  return crypto.createHash("sha256").update(prompt).digest("hex");
}

export async function generateWithClaude(promptInput: any) {
  const prompt = typeof promptInput === 'string' ? promptInput : JSON.stringify(promptInput);
  const prompt_hash = hashPrompt(prompt);

  // 1. Intentar leer de caché (TTL 24h)
  try {
    const { data: cacheEntry } = await supabase
      .from("gemini_cache")
      .select("response, created_at")
      .eq("prompt_hash", prompt_hash)
      .maybeSingle();

    if (cacheEntry) {
      const createdAt = new Date(cacheEntry.created_at);
      const now = new Date();
      if ((now.getTime() - createdAt.getTime()) < 24 * 60 * 60 * 1000) {
        console.log(`[CLAUDE CACHÉ HIT] Hash: ${prompt_hash}`);
        return cacheEntry.response;
      }
    }
  } catch (err) {
    console.warn("[CLAUDE CACHÉ ERROR] Falló lectura de caché:", err);
  }

  // 2. Si no hay caché, llamar a la API
  try {
    console.log(`📡 [CLAUDE API CALL] Hitting Anthropic (claude-3-5-haiku-20241022) for strategy refinement... (Prompt Hash: ${prompt_hash})`);
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2500,
      messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
    });
    console.log(`✅ [CLAUDE API SUCCESS] Response received from Anthropic. (Usage documented)`);

    const responseText = message.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('\n');

    if (responseText) {
      const cleanedText = responseText
        .replace(/```json\n?|```/g, "")
        .trim();
        
      let data;
      try {
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        console.warn("Claude response parsing failed, returning text object:", parseError);
        data = { text: cleanedText };
      }

      // 3. Guardar en caché antes de retornar
      try {
        await supabase.from("gemini_cache").upsert({
          prompt_hash,
          response: data,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      } catch (cacheStoreError) {
        console.error("[CLAUDE CACHÉ STORE ERROR]:", cacheStoreError);
      }

      return data;
    }
    throw new Error('Respuesta de Claude no es texto');
  } catch (error) {
    console.error('Error en Claude API:', error);
    throw error;
  }
}
