const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_PROFESSIONAL || process.env.GEMINI_API_KEY_1);
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' }, { apiVersion: 'v1beta' });
const tools = [{ googleSearch: {} }];

async function research() {
  const targets = [
    'Zara/Inditex México',
    'Shein México',
    'Temu México',
    'H&M México',
    'Grupo Axo México',
    'Ripley Chile'
  ];

  console.log("# RESEARCH RESULTS FOR NOWPORTS\n");

  for (const t of targets) {
    console.log(`--- ${t} ---`);
    const prompt = `Investiga la logística de importación para ${t}. 
    Responde estrictamente estas 3 preguntas basados en datos de mercado reales:
    1. ¿Qué importan y desde dónde exactamente?
    2. ¿Qué volumen mueven aproximadamente (ej. contenedores/año o toneladas)?
    3. ¿Qué freight forwarder o operador logístico usan actualmente (ej. DHL, DSV, K+N)?
    
    Retorna los datos en este formato JSON para procesar:
    {
      "name": "${t}",
      "country": "${t.includes('México') ? 'México' : 'Chile'}",
      "imports": "",
      "volume": "",
      "forwarder": ""
    }`;

    try {
      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools
      });

      const text = res.response.text();
      console.log(text);
    } catch (e) {
      console.error(`Error researching ${t}:`, e.message);
    }
    console.log("\n");
  }
}

research();
