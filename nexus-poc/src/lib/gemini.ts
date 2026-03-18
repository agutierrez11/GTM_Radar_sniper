import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";
import { supabase } from "./supabase";

export interface GeminiResponse {
  data: any;
  cached: boolean;
  timestamp: string;
}

const apiKeys = [
  process.env.GEMINI_API_KEY_PROFESSIONAL, // PRIORIDAD 1: Professional (Paid)
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
  const maxAttempts = 50; // Permitir rotación completa y múltiples ciclos de espera en Free Tier

  while (attempts < maxAttempts) {
    const key = apiKeys[currentKeyIndex];
    console.log(`[GEMINI ATTEMPT ${attempts + 1}] Usando Key Index: ${currentKeyIndex}`);

    try {
      const genAI = new GoogleGenerativeAI(key);
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
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
        } catch (innerError: any) {
          lastError = innerError;
          if (innerError?.status === 404 || innerError?.message?.includes("404")) {
            console.warn(`[GEMINI WARN] Modelo ${modelName} no disponible para esta llave. Probando siguiente...`);
            continue;
          }
          throw innerError; // Si no es 404, salir al catch exterior para rotar llave
        }
      }
      throw lastError; // Si llega aquí es que todos los modelos del loop fallaron
    } catch (error: any) {
      const maskedKey = key ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : "NULL";
      console.error(`[GEMINI ERROR] Attempt ${attempts + 1} with Key Index ${currentKeyIndex} (${maskedKey}):`, error?.status || error?.message);

      if (error?.status === 404 || error?.message?.includes("404")) {
        console.error(`[GEMINI CRITICAL] El modelo gemini-2.0-flash NO fue encontrado para la llave ${maskedKey}. Revisa si la llave tiene acceso a este modelo en AI Studio.`);
      }

      // Si es error de cuota (429) o similar
      if (error?.status === 429 || error?.message?.includes("429")) {
        // Rotar inmediatamente sin esperar si tenemos más llaves disponibles en este ciclo
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        console.log(`[QUICK ROTATION] Reintentando inmediatamente con Key Index: ${currentKeyIndex}`);
        
        // Si ya dimos una vuelta completa al pool (cada 5 intentos), entonces sí aplicamos backoff
        if ((attempts + 1) % apiKeys.length === 0) {
          const wait = waitTimes[Math.floor(attempts / apiKeys.length)] || 60000;
          console.log(`[POOL SATURATED] Esperando ${wait / 1000}s antes de siguiente ciclo de pool...`);
          await sleep(wait);
        } else {
          // Breve delay preventivo para no saturar el siguiente socket inmediatamente
          await sleep(500); 
        }
      } else {
        // Otros errores graves (500, etc): rotar inmediatamente
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        await sleep(1000);
      }
      
      attempts++;
    }
  }

  throw new Error("Gemini falló tras agotar todos los intentos. El sistema de resiliencia fue superado.");
}
