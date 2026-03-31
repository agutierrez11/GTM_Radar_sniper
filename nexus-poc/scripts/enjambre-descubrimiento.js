const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY_PROFESSIONAL || process.env.GEMINI_API_KEY_1;
const genAI = new GoogleGenerativeAI(geminiApiKey);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const queries = [
  // Infraestructura / Open Finance / BaaS
  "BaaS Banking as a Service LATAM startups 2026",
  "Open Finance API hub LATAM México Colombia 2026",
  "core banking fintech infraestructura LATAM 2026",
  "orquestador de pagos LATAM API fintech 2026",
  
  // Wealthtech & Proptech
  "wealthtech inversiones robo-advisor LATAM 2026",
  "proptech real estate tokenización LATAM startups",
  "fintech inversiones accesibles México Colombia Brasil 2026",
  
  // SME Lending / PyMEs
  "SME lending factoring digital LATAM startups 2026",
  "tarjetas corporativas gastos empresas LATAM fintech",
  "capital de trabajo PyMEs fintech México Colombia 2026",
  
  // Fuentes estratégicas (InversorLatam)
  "site:inversorlatam.com fintech startups LATAM 2026",
  "site:inversorlatam.com infraestructura pagos adquirencia LATAM",
  "site:inversorlatam.com levantamiento capital rondas fintech LATAM",
  "site:inversorlatam.com open finance banking as a service LATAM",
  
  // Regiones inexploradas
  "fintech Centroamérica Guatemala Costa Rica 2026",
  "fintech Caribe República Dominicana Puerto Rico 2026",
  "fintech Uruguay Paraguay startup ecosistema 2026",
  "fintech Panamá Honduras El Salvador 2026",
  
  // IA aplicada a fintech
  "IA inteligencia artificial fintech LATAM startups 2026",
  "credit scoring IA alternativo LATAM fintech 2026",
  "fraud detection fintech LATAM IA 2026"
];

async function main() {
  console.log("Iniciando Enjambre Descubrimiento...");

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    console.log(`\n\n[Query ${i + 1}/${queries.length}] Consultando: "${q}"`);

    const prompt = `
Eres un analista de descubrimiento de mercado especializado en startups B2B y Fintech en LATAM.
Tu tarea es usar Google Search para la siguiente consulta y extraer al menos 3 a 5 empresas o startups recientes y relevantes.

Consulta: "${q}"

Para cada empresa encontrada, DEBES llamar a la función 'agregarEmpresa' con los siguientes datos:
- name (Nombre de la empresa)
- description (Qué hace, breve, en español)
- website (URL si está disponible, si no, déjalo en null)
- country (País principal de operación en LATAM)
- segment_latamfintech (Segmento Fintech: ejemplo 'Lending', 'Payments', 'Insurtech', 'B2B', etc.)
- product_category (Sub-categoría del producto)

Céntrate especialmente en buscar startups que estén surgiendo o haciendo noticias recientes, incluso si es solo un lanzamiento reciente.
    `;

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
      }, { apiVersion: 'v1beta' });

      const tools = [
        { googleSearch: {} },
        {
          functionDeclarations: [{
            name: "agregarEmpresa",
            description: "Registra una empresa descubierta en la base de datos.",
            parameters: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                description: { type: "STRING", description: "Descripción breve en español de lo que hace la empresa" },
                website: { type: "STRING", description: "URL principal de la empresa, o vacío si no se encuentra" },
                country: { type: "STRING", description: "País en LATAM. Ej: México, Colombia, Brasil" },
                segment_latamfintech: { type: "STRING", description: "Segmento, ej: Lending, Payments, Wealthtech" },
                product_category: { type: "STRING", description: "Categoría de producto. Ej: BNPL, Crypto, Factoring" },
              },
              required: ["name", "description", "country", "segment_latamfintech"]
            }
          }]
        }
      ];

      const toolConfig = { includeServerSideToolInvocations: true };

      const chatSession = model.startChat({
        tools,
        toolConfig,
        generationConfig: { temperature: 0.3 }
      });

      // Turn 1
      const result = await chatSession.sendMessage(prompt);
      
      const parts = result.response.candidates[0].content.parts;
      const functionCalls = parts.filter(p => p.functionCall);

      if (functionCalls.length === 0) {
        console.log(`[!] No se encontraron empresas para la query: "${q}"`);
      } else {
        // En discovery, Gemini suele retornar múltiples functionCalls en sequence
        const functionResponses = [];

        for (const callPart of functionCalls) {
          const fc = callPart.functionCall;
          const { name, description, website, country, segment_latamfintech, product_category } = fc.args;
          const fcId = fc.name;

          if (!name) continue;

          // 1. Verificar duplicados (case insensitive)
          const { data: existing, error: searchError } = await supabase
            .from('empresas_v2')
            .select('id')
            .ilike('name', name)
            .limit(1);

          if (existing && existing.length > 0) {
            console.log(`[SKIP] ${name} — ya existe`);
            functionResponses.push({
              functionResponse: {
                name: fc.name,
                response: { status: 'skipped', reason: 'already exists' }
              }
            });
            continue;
          }

          // 2. Insertar nueva
          const insertData = {
            name,
            description,
            website,
            country,
            segment_latamfintech,
            product_category,
            source: 'enjambre_discovery_v2',
            created_at: new Date().toISOString()
          };

          const { error: insertError } = await supabase
            .from('empresas_v2')
            .insert(insertData);

          if (insertError) {
            console.log(`[ERROR] Falló al insertar ${name}: ${insertError.message}`);
            functionResponses.push({
              functionResponse: {
                name: fc.name,
                response: { status: 'error', reason: insertError.message }
              }
            });
          } else {
            console.log(`[NUEVA] ${name} — ${country || 'LATAM'} — ${segment_latamfintech || 'Fintech'} ✅`);
            functionResponses.push({
              functionResponse: {
                name: fc.name,
                response: { status: 'inserted' }
              }
            });
          }
        }

        // Turn 2: Si hubo functionCalls, hay que enviar las respuestas de vuelta al modelo para cerrar el loop
        if (functionResponses.length > 0) {
          try {
            await chatSession.sendMessage(functionResponses);
          } catch (replyErr) {
            // Es comun que en multi-function loops, la API rechace si no coinciden ids en tools, 
            // pero el trabajo importante en DB ya se hizo arriba.
            // console.log("Finalizando chat de forma silenciosa...");
          }
        }
      }

    } catch (err) {
      console.log(`[ERROR QUERY] "${q}" falló en Gemini ❌ (${err.message})`);
    }

    // Delay de 2 segundos
    await delay(2000);
  }

  console.log("\\nProceso de Descubrimiento completado.");
}

main();
