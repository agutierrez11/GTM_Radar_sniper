import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface GeminiResponse {
  data: any;
  cached: boolean;
  timestamp: string;
}

const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

/**
 * Función utilitaria para esperar (ms)
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Genera un hash SHA256 de un string
 */
function hashPrompt(prompt: string): string {
  return crypto.createHash("sha256").update(prompt).digest("hex");
}

/**
 * Función única de acceso a Gemini con resiliencia total.
 * 1. Mira caché en Supabase (gemini_cache)
 * 2. Si no hay caché, ejecuta loop de reintentos con Backoff y Rotación.
 * 3. Guarda en caché y retorna.
 */
export async function generateWithFallback(prompt: string): Promise<GeminiResponse> {
  const prompt_hash = hashPrompt(prompt);

  // --- PRIORIDAD 3: CACHÉ INTELIGENTE ---
  try {
    const { data: cacheEntry, error: cacheError } = await supabase
      .from("gemini_cache")
      .select("response, created_at")
      .eq("prompt_hash", prompt_hash)
      .maybeSingle();

    if (!cacheError && cacheEntry) {
      // Validar expiración (24 horas)
      const createdAt = new Date(cacheEntry.created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 24) {
        console.log(`[CACHÉ HIT] Hash: ${prompt_hash}`);
        return {
          data: cacheEntry.response,
          cached: true,
          timestamp: cacheEntry.created_at,
        };
      }
    }
  } catch (err) {
    console.warn("[CACHÉ ERROR] Falló lectura de caché, procediendo a API:", err);
  }

  // --- PRIORIDAD 1 & 2: BACKOFF Y ROTACIÓN ---
  const waitTimes = [10000, 20000, 30000]; // 10s, 20s, 30s
  let attempts = 0;
  const maxAttempts = 12; // Permitir rotación completa de las 5 keys

  while (attempts < maxAttempts) {
    const key = apiKeys[currentKeyIndex];
    console.log(`[GEMINI ATTEMPT ${attempts + 1}] Usando Key Index: ${currentKeyIndex}`);

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Limpieza de Markdown si existe
      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      let data;
      try {
        data = JSON.parse(cleanedText);
      } catch {
        data = cleanedText; // Fallback a texto plano
      }

      const timestamp = new Date().toISOString();

      // Guardar en Caché
      try {
        await supabase.from("gemini_cache").upsert({
          prompt_hash,
          response: data,
          created_at: timestamp,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      } catch (cacheStoreError) {
        console.error("[CACHÉ STORE ERROR]:", cacheStoreError);
      }

      return {
        data,
        cached: false,
        timestamp,
      };

    } catch (error: any) {
      console.error(`[GEMINI ERROR] Attempt ${attempts + 1}:`, error?.status || error?.message);

      // Si es error de cuota (429) o similar
      if (error?.status === 429 || error?.message?.includes("429")) {
        const wait = waitTimes[attempts] || 60000;
        console.log(`[BACKOFF] Esperando ${wait / 1000}s antes de reintentar...`);
        
        await sleep(wait);
        
        // Rotar llave si ya falló 2 veces con la misma
        if (attempts >= 2) {
          currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
          console.log(`[ROTATION] Cambiando a Key Index: ${currentKeyIndex}`);
        }
      } else {
        // Otros errores graves: rotar inmediatamente
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        await sleep(1000);
      }
      
      attempts++;
    }
  }

  throw new Error("Gemini falló tras 5 intentos. El sistema de cola fue superado.");
}
