import { GoogleGenerativeAI } from "@google/generative-ai";

const key = "AIzaSyCCYzn2-5v_KYztyaQ0_AoKgfM55Cb62N8";

async function listModels() {
  try {
    // Note: The JS SDK doesn't have a direct listModels method that works with API keys easily in some versions,
    // but we can try to fetch the list via REST to be sure.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log("Models:", JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.log("❌ List Models Error:", e.message);
  }
}

listModels();
