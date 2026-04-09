import { GoogleGenerativeAI } from "@google/generative-ai";

const keysToTest = [
  { label: "GCloud Billing Key", key: "AIzaSyCCYzn2-5v_KYztyaQ0_AoKgfM55Cb62N8" },
  { label: "AIzaSyAaJE (Arsenal Key 3)", key: "AIzaSyAaJE3OHtPa-Xv87-q_rkCAYqQpzhJqp4A" },
];

async function testKey(label: string, key: string) {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Di solo 'OK' en una palabra.");
    const text = result.response.text().trim();
    console.log(`✅ [${label}] VÁLIDA — Respuesta: "${text}"`);
  } catch (e: any) {
    const status = e?.status || e?.message?.substring(0, 120);
    console.log(`❌ [${label}] FALLIDA — Error: ${status}`);
  }
}

Promise.all(keysToTest.map(k => testKey(k.label, k.key)));
