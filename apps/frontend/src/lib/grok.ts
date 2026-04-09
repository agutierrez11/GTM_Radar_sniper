import OpenAI from 'openai';
import crypto from 'crypto';
import { supabase } from './supabase';

/**
 * xAI Grok Integration (OpenAI Compatible)
 */
const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || '',
  baseURL: "https://api.x.ai/v1",
});

function hashPrompt(prompt: string): string {
  return crypto.createHash("sha256").update(prompt).digest("hex");
}

export async function generateWithGrok(prompt: string) {
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
        console.log(`[GROK (xAI) CACHÉ HIT] Hash: ${prompt_hash}`);
        return cacheEntry.response;
      }
    }
  } catch (err) {
    console.warn("[GROK (xAI) CACHÉ ERROR] Falló lectura de caché:", err);
  }

  // 2. Si no hay caché, llamar a la API de xAI
  try {
    const completion = await xai.chat.completions.create({
      model: "grok-beta", // Modelo estándar de xAI
      messages: [
        { role: "system", content: "Eres un analista experto en señales de mercado y Fintech en Latam. Proporciona respuestas concisas y estructuradas en JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content || "";
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.warn("Grok response parsing failed, returning text object:", parseError);
      data = { text: responseText };
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
      console.error("[GROK (xAI) CACHÉ STORE ERROR]:", cacheStoreError);
    }

    return data;
  } catch (error) {
    console.error('Error en xAI Grok API:', error);
    throw error;
  }
}
