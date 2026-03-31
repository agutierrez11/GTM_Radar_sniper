import OpenAI from 'openai';
import crypto from 'crypto';
import { supabase } from './supabase';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: "https://api.groq.com/openai/v1",
});

function hashPrompt(prompt: string): string {
  // Hard Reset v5.1: Invalida el caché médico anterior añadiendo un salt forense
  return crypto.createHash("sha256").update(prompt + "v5.1-forensic").digest("hex");
}

export async function generateWithGroq(prompt: string) {
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
        console.log(`[GROQ CACHÉ HIT] Hash: ${prompt_hash}`);
        return cacheEntry.response;
      }
    }
  } catch (err) {
    console.warn("[GROQ CACHÉ ERROR] Falló lectura de caché:", err);
  }

  // 2. Si no hay caché, llamar a la API de Groq
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content || "";
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.warn("Groq response parsing failed, returning text object:", parseError);
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
      console.error("[GROQ CACHÉ STORE ERROR]:", cacheStoreError);
    }

    return data;
  } catch (error) {
    console.error('Error en Groq API:', error);
    throw error;
  }
}
