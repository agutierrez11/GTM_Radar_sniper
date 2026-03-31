import OpenAI from 'openai';
import crypto from 'crypto';
import { getSupabase } from './supabase';

let groqClient: OpenAI | null = null;

function getGroqClient() {
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY || '',
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return groqClient;
}

function hashPrompt(prompt: string): string {
  return crypto.createHash("sha256").update(prompt).digest("hex");
}

export async function generateWithGroq(prompt: string) {
  const prompt_hash = hashPrompt(prompt);

  // 1. Intentar leer de caché (TTL 24h)
  const supabaseClient = getSupabase();
  try {
    const { data: cacheEntry } = await supabaseClient
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
    console.log(`📡 [GROQ API CALL] Hitting Llama 3.3 via Groq... (Prompt Hash: ${prompt_hash})`);
    const groq = getGroqClient();
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
      await supabaseClient.from("gemini_cache").upsert({
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
