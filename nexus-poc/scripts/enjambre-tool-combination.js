const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY_PROFESSIONAL || process.env.GEMINI_API_KEY_1;
const genAI = new GoogleGenerativeAI(geminiApiKey);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log("Iniciando Enjambre Tool Combination...");

  // Support for --id argument
  const args = process.argv.slice(2);
  const idArgIndex = args.indexOf('--id');
  const targetId = idArgIndex !== -1 ? args[idArgIndex + 1] : null;

  let query = supabase
    .from('empresas_v2')
    .select('id, name, country, city, segment_latamfintech, product_category, description, markets_latam, funding_stage, total_raised, strategic_notes, icp_score, competitors_verified');

  if (targetId) {
    console.log(`Buscando solo empresa con ID: ${targetId}`);
    query = query.eq('id', targetId);
  } else {
    // Original filter for batch processing
    query = query
      .not('description', 'is', null)
      .is('signal_context', null)
      .order('icp_score', { ascending: false });
  }

  const { data: empresas, error } = await query;

  if (error) {
    console.error("Error fetching companies:", error);
    return;
  }

  const total = empresas.length;
  console.log(`Empresas a procesar: ${total}`);

  for (let i = 0; i < total; i++) {
    const empresa = empresas[i];

    const competidores = Array.isArray(empresa.competitors_verified)
      ? empresa.competitors_verified.join(', ')
      : 'No identificados';

    const mercados = Array.isArray(empresa.markets_latam)
      ? empresa.markets_latam.join(', ')
      : empresa.country || 'LATAM';

    const prompt = `
Eres un analista de inteligencia de mercado especializado en fintech latinoamericano.

Empresa: ${empresa.name}
Segmento: ${empresa.segment_latamfintech || empresa.product_category || 'Fintech'}
Descripción actual: ${empresa.description || 'N/A'}
Mercados: ${mercados}
Funding stage: ${empresa.funding_stage || 'N/A'}
Total raised: ${empresa.total_raised || 'N/A'}
Competidores: ${competidores}
${empresa.strategic_notes ? `Notas estratégicas: ${empresa.strategic_notes}` : ''}

Objetivos:
1. Usa Google Search para encontrar señales de mercado de las últimas 4 semanas de ${empresa.name} en ${mercados}.
2. Revisa la descripción actual y si encuentras información más actualizada o precisa sobre lo que hace la empresa, propón una 'description_update' (máximo 40 palabras, en español). Si la actual está bien, omítelo.
3. Si descubres nuevos competidores clave en las noticias, inclúyelos en 'competitors'.

Llama a la función 'guardarEnriquecimiento' con los datos estructurados.
`;

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
      }, { apiVersion: 'v1beta' });

      const tools = [
        { googleSearch: {} },
        {
          functionDeclarations: [{
            name: "guardarEnriquecimiento",
            description: "Guarda señales de mercado y actualizaciones de información de la empresa.",
            parameters: {
              type: "OBJECT",
              properties: {
                headline: { type: "STRING", description: "Señal principal actual, máx 15 palabras" },
                signals: { type: "ARRAY", items: { type: "STRING" }, description: "3 señales concretas verificables" },
                sentiment: { type: "STRING", description: "bullish, bearish o neutral" },
                sources: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      title: { type: "STRING" },
                      url: { type: "STRING" }
                    }
                  }
                },
                description_update: { type: "STRING", description: "Opcional. Nueva descripción mejorada, máx 40 palabras." },
                competitors: { type: "ARRAY", items: { type: "STRING" }, description: "Opcional. Competidores actualizados encontrados." }
              },
              required: ["headline", "signals", "sentiment", "sources"]
            }
          }]
        }
      ];

      const toolConfig = { includeServerSideToolInvocations: true };

      // Turn 1
      const result1 = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools,
        toolConfig,
        generationConfig: { temperature: 0.2 }
      });

      const parts1 = result1.response.candidates[0].content.parts;
      const functionCallPart = parts1.find(p => p.functionCall);

      let functionArgs = null;

      if (functionCallPart && functionCallPart.functionCall) {
        functionArgs = functionCallPart.functionCall.args;
        const fcId = functionCallPart.functionCall.name; // Usando fallback en SDKs actuales si falta id

        await model.generateContent({
          contents: [
            { role: 'user', parts: [{ text: prompt }] },
            result1.response.candidates[0].content,
            {
              role: 'user',
              parts: [{
                functionResponse: {
                  name: "guardarEnriquecimiento",
                  response: { status: 'saved' }
                }
              }]
            }
          ],
          tools,
          toolConfig,
          generationConfig: { temperature: 0.2 }
        });
      } else {
        // Fallback textual parsing si decide no usar tool (raro)
        const rawText = parts1.filter(p => p.text).map(p => p.text).join('').replace(/```json|```/g, '').trim();
        try {
          functionArgs = JSON.parse(rawText);
        } catch {
          console.log(`[${i + 1}/${total}] ${empresa.name} — error de formato JSON ❌`);
          continue;
        }
      }

      if (functionArgs) {
        const signalContext = {
          headline: functionArgs.headline,
          signals: functionArgs.signals,
          sentiment: functionArgs.sentiment || 'neutral',
          sources: functionArgs.sources,
          generated_at: new Date().toISOString()
        };

        const updateData = {
          signal_context: signalContext,
          has_full_data: true
        };

        if (functionArgs.description_update && functionArgs.description_update.length > 10) {
          updateData.description = functionArgs.description_update;
        }

        if (functionArgs.competitors && Array.isArray(functionArgs.competitors) && functionArgs.competitors.length > 0) {
          // Merge o Replace de competidores. Si es un string en DB, hay que parsearlo primero o guardarlo como array. 
          // En la base sabemos que es string[] (por pgvector o jsonb).
          updateData.competitors_verified = functionArgs.competitors;
        }

        const { error: updateError } = await supabase
          .from('empresas_v2')
          .update(updateData)
          .eq('id', empresa.id);

        if (updateError) {
          console.log(`[${i + 1}/${total}] ${empresa.name} — error en DB ❌`);
        } else {
          console.log(`[${i + 1}/${total}] ${empresa.name} — ${functionArgs.sentiment} ✅`);
        }
      }

    } catch (err) {
      console.log(`[${i + 1}/${total}] ${empresa.name} — error Gemini ❌ (${err.message})`);
    }

    // Rate limit para GEMINI y Supabase: 1 segundo
    await delay(1000);
  }
  
  console.log("Proceso del Enjambre completado.");
}

main();
