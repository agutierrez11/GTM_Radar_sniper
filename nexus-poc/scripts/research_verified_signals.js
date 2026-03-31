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

  console.log("# VERIFIED NEWS SIGNALS FOR NOWPORTS\n");

  for (const company of companies) {
    console.log(`--- ${company} ---`);
    const prompt = `Busca en Google News información RECIENTE (últimos 6 meses, ideal balance 2025-2026) sobre la logística, importación, expansión o supply chain de ${company}.
    
    REGLA DE ORO NERV:
    1. Debes encontrar una URL exacta de un artículo de noticia o reporte oficial.
    2. Si no hay URL verificable de los últimos 6 meses, marca Confianza como "[Inferencia — verificar antes de usar en reunión]" y pon Fuente: [Inferencia — sin fuente].
    
    FORMATO OBLIGATORIO:
    Señal: [el insight específico en una frase]
    Fuente: [URL completa del artículo]
    Fecha: [Mes Año]
    Confianza: VERIFICADO o [Inferencia — sin fuente]
    Por qué importa para Nowports: [una línea de fit estratégico]`;

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
