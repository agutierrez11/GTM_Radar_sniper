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
  process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  process.env.GEMINI_API_KEY,
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
  // Hard Reset v5.1: Invalida el caché médico anterior añadiendo un salt forense
  return crypto.createHash("sha256").update(prompt + "v5.1-forensic").digest("hex");
}

/**
 * Función única de acceso a Gemini con resiliencia total.
 * 1. Mira caché en Supabase (gemini_cache)
 * 2. Si no hay caché, ejecuta loop de reintentos con Backoff y Rotación.
 * 3. Guarda en caché y retorna.
 */
export async function generateWithFallback(prompt: string): Promise<GeminiResponse> {
  const prompt_hash = hashPrompt(prompt);

  // --- BYPASS GOOGLE: si GOOGLE_APIS_PAUSED=true, saltar directo a Claude/Groq ---
  if (process.env.GOOGLE_APIS_PAUSED === "true") {
    console.log("[GOOGLE PAUSED] Bypassing Gemini — enrutando a Claude/Groq");
    return generateWithFallbackNonGoogle(prompt, prompt_hash);
  }

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
  const waitTimes = [2000, 4000, 6000]; // reducido: 2s, 4s, 6s
  let attempts = 0;
  const maxAttempts = Math.max(apiKeys.length * 2, 3); // máx 3 intentos si hay 1 key

  while (attempts < maxAttempts) {
    const key = apiKeys[currentKeyIndex];
    console.log(`[GEMINI ATTEMPT ${attempts + 1}/${maxAttempts}] Usando Key Index: ${currentKeyIndex}`);

    try {
      const genAI = new GoogleGenerativeAI(key);
      const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
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

      // Key inválida o sin permisos — no reintentar, ir directo a Claude/Groq
      if (error?.status === 400 || error?.status === 401 || error?.status === 403 ||
          error?.message?.includes("API Key not found") || error?.message?.includes("API_KEY_INVALID")) {
        console.error(`[GEMINI DEAD KEY] Key inválida o sin permisos. Saltando directo a Claude/Groq.`);
        return generateWithFallbackNonGoogle(prompt, prompt_hash);
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

  // Gemini agotado — fallthrough a Claude/Groq aunque GOOGLE_APIS_PAUSED=false
  console.warn("[GEMINI EXHAUSTED] Todos los intentos fallaron. Enrutando a Claude/Groq como emergencia.");
  return generateWithFallbackNonGoogle(prompt, prompt_hash);
}

/**
 * Fallback engine sin Google: Claude 3.5 Sonnet → Groq Llama-3.3-70B
 * Activado automáticamente cuando GOOGLE_APIS_PAUSED=true
 * Los 3 agentes (Cosechador, Retador, Sintetizador) siguen funcionando al 100%.
 * Solo baja la confianza RAG (sin embeddings de conocimiento).
 */
async function generateWithFallbackNonGoogle(prompt: string, prompt_hash: string): Promise<GeminiResponse> {
  const timestamp = new Date().toISOString();

  // 1. Intentar caché (misma tabla, sin importar el LLM que lo guardó)
  try {
    const { data: cacheEntry } = await supabase
      .from("gemini_cache")
      .select("response, created_at")
      .eq("prompt_hash", prompt_hash)
      .maybeSingle();

    if (cacheEntry) {
      const diffHours = (Date.now() - new Date(cacheEntry.created_at).getTime()) / 3_600_000;
      if (diffHours < 24) {
        console.log(`[NON-GOOGLE CACHÉ HIT] Hash: ${prompt_hash}`);
        return { data: cacheEntry.response, cached: true, timestamp: cacheEntry.created_at };
      }
    }
  } catch {}

  // 2. Claude 3.5 Sonnet (primario)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      });
      const raw = (message.content[0] as any).text as string;
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      let data: any;
      try { data = JSON.parse(cleaned); } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        try { data = match ? JSON.parse(match[0]) : cleaned; } catch { data = cleaned; }
      }
      await supabase.from("gemini_cache").upsert({ prompt_hash, response: data, created_at: timestamp, expires_at: new Date(Date.now() + 86_400_000).toISOString() }).catch(() => {});
      console.log("[NON-GOOGLE] Claude 3.5 Sonnet respondió ✓");
      return { data, cached: false, timestamp };
    } catch (e: any) {
      console.warn("[NON-GOOGLE] Claude falló:", e?.message);
    }
  }

  // 3. OpenRouter (Claude/Llama via proxy — fallback)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const orModel = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";
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
          max_tokens: 4096,
          temperature: 0.1,
        }),
      });
      const orData = await res.json();
      if (!res.ok) {
        const errMsg = orData?.error?.message || JSON.stringify(orData).slice(0, 200);
        throw new Error(`OpenRouter HTTP ${res.status}: ${errMsg}`);
      }
      const raw = orData.choices[0].message.content || "";
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      let data: any;
      try { data = JSON.parse(cleaned); } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        try { data = match ? JSON.parse(match[0]) : cleaned; } catch { data = cleaned; }
      }
      await supabase.from("gemini_cache").upsert({ prompt_hash, response: data, created_at: timestamp, expires_at: new Date(Date.now() + 86_400_000).toISOString() }).catch(() => {});
      console.log(`[NON-GOOGLE] OpenRouter (${orModel}) respondió ✓`);
      return { data, cached: false, timestamp };
    } catch (e: any) {
      console.warn("[NON-GOOGLE] OpenRouter falló:", e?.message);
    }
  }

  // 4. Groq Llama-3.3-70B (último recurso)
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 8192,
          temperature: 0.1,
          ...(prompt.toLowerCase().includes("json") ? { response_format: { type: "json_object" } } : {}),
        }),
      });
      if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
      const groqData = await res.json();
      const raw = groqData.choices[0].message.content || "";
      let data: any;
      try { data = JSON.parse(raw); } catch { data = raw; }
      await supabase.from("gemini_cache").upsert({ prompt_hash, response: data, created_at: timestamp, expires_at: new Date(Date.now() + 86_400_000).toISOString() }).catch(() => {});
      console.log("[NON-GOOGLE] Groq Llama-3.3 respondió ✓");
      return { data, cached: false, timestamp };
    } catch (e: any) {
      console.warn("[NON-GOOGLE] Groq falló:", e?.message);
    }
  }

  const configured = [
    process.env.ANTHROPIC_API_KEY && "ANTHROPIC_API_KEY",
    process.env.OPENROUTER_API_KEY && "OPENROUTER_API_KEY",
    process.env.GROQ_API_KEY && "GROQ_API_KEY",
  ].filter(Boolean);
  throw new Error(`Todos los LLMs fallaron. Configuradas: [${configured.join(", ") || "NINGUNA"}]. Revisa las variables en Vercel.`);
}
