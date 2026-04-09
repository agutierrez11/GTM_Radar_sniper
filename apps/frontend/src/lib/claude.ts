import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import { supabase } from './supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

function hashPrompt(prompt: string): string {
  return crypto.createHash("sha256").update(prompt).digest("hex");
}

export async function generateWithClaude(prompt: string) {
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
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const responseText = content.text;
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
