const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_PROFESSIONAL || process.env.GEMINI_API_KEY_1);
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' }, { apiVersion: 'v1beta' });
const tools = [{ googleSearch: {} }];

async function research() {
  const companies = [
    "Zara (Inditex)", "Shein México", "Temu México", "H&M México", "Grupo Axo", "Ripley Chile",
    "Walmart Chile", "Cencosud", "Falabella", "Liverpool México", "Chedraui", "STF Group", "Miniso México",
    "Nadro", "Laboratorio Chile (Teva)", "Fanasa", "Birmex", "SalfaCorp", "Cemex", "Besalco",
    "Aceros Crea", "Samsung Electronics", "Apple", "Xiaomi", "Agrocommerce", "La Costeña"
  ];

  console.log("# NEWS SIGNALS FOR NOWPORTS\n");

  for (const company of companies) {
    console.log(`--- ${company} ---`);
    const prompt = `Busca en Google News información RECIENTE (últimos 6 meses, ideal balance 2025-2026) sobre la logística, importación, expansión o supply chain de ${company}.
    
    CRITERIOS:
    - Debe ser una noticia específica, anuncio o dato concreto.
    - Si no hay nada en los últimos 6 meses, responde estrictamente: "[Sin señal reciente — prospección fría]".
    
    FORMATO (si hay señal):
    Señal: [el insight específico]
    Fecha: [cuándo ocurrió]
    Por qué importa para Nowports: [una línea de fit estratégico]
    
    Solo devuelve el texto formateado o el mensaje de fallback.`;

    try {
      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools
      });

      console.log(res.response.text());
    } catch (e) {
      console.error(`Error for ${company}:`, e.message);
    }
    console.log("\n");
  }
}

research();
