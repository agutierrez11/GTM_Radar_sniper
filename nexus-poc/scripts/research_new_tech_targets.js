const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_PROFESSIONAL || process.env.GEMINI_API_KEY_1);
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' }, { apiVersion: 'v1beta' });
const tools = [{ googleSearch: {} }];

async function research() {
  const companies = [
    { name: "Grupo Elektra", context: "México, importa electrónica y línea blanca desde Asia" },
    { name: "AbcDin", context: "Chile, retailer de electrónica, importación directa China" },
    { name: "Syscom", context: "México, distribuidor mayorista de tecnología" }
  ];

  console.log("# VERIFIED SIGNALS FOR NEW TECH TARGETS\n");

  for (const company of companies) {
    console.log(`--- ${company.name} ---`);
    const prompt = `Busca en Google News información RECIENTE (últimos 6 meses, ideal balance 2025-2026) sobre la logística, importación, expansión o supply chain de ${company.name} (${company.context}).
    
    REGLA DE ORO NERV:
    1. Debes encontrar una URL exacta de un artículo de noticia o reporte oficial.
    2. Si no hay URL verificable de los últimos 6 meses, responde estrictamente: "[Sin señal — prospección fría]".
    
    FORMATO OBLIGATORIO (si hay señal):
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
      console.error(`Error for ${company.name}:`, e.message);
    }
    console.log("\n");
  }
}

research();
