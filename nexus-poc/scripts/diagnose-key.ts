import { GoogleGenerativeAI } from "@google/generative-ai";

const key = "AIzaSyCCYzn2-5v_KYztyaQ0_AoKgfM55Cb62N8";

async function diagnose() {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Test");
    console.log("✅ Success!");
  } catch (e: any) {
    console.log("❌ Error Details:");
    console.log("Status:", e.status);
    console.log("Message:", e.message);
    if (e.response) {
      console.log("Response Body:", JSON.stringify(e.response, null, 2));
    }
  }
}

diagnose();
