import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const keys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

async function check() {
  for (const key of keys) {
    try {
      console.log(`Checking key: ${key?.substring(0, 10)}...`);
      const genAI = new GoogleGenerativeAI(key as string);
      // @ts-ignore
      const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
      // Instead of listModels which might not be in the simple SDK, let's just try a simple prompt
      const result = await models.generateContent("test");
      console.log(`✅ Key works with gemini-1.5-flash. Response: ${result.response.text()}`);
    } catch (e: any) {
      console.log(`❌ Key fails with gemini-1.5-flash: ${e.message}`);
      
      try {
        const genAI = new GoogleGenerativeAI(key as string);
        const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const res2 = await model2.generateContent("test");
        console.log(`✅ Key works with gemini-1.5-flash-latest`);
      } catch (e2: any) {
        console.log(`❌ Key fails with gemini-1.5-flash-latest: ${e2.message}`);
      }
    }
  }
}

check();
