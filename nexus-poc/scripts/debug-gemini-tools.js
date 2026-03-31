const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function debug() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_PROFESSIONAL || process.env.GEMINI_API_KEY_1);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1beta" });

  const prompt = "Investiga sobre MexPago y Airwallex en México.";
  const tools = [
    { googleSearch: {} }
  ];

  console.log("🚀 Probando Gemini Tool Combination en Standalone...");
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools
    });
    console.log("✅ Éxito:", JSON.stringify(result.response, null, 2));
  } catch (err) {
    console.error("❌ ERROR DETALLADO:");
    console.error(err);
    if (err.response) console.error("BODY:", JSON.stringify(err.response, null, 2));
  }
}

debug();
