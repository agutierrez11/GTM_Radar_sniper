
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

const envPath = "C:/Users/nerv_gtm/.gemini/antigravity/scratch/nexus-poc/.env.local";
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach(line => {
  const [key, value] = line.split("=");
  if (key && value) env[key.trim()] = value.trim();
});

const keys = [
  env.GEMINI_API_KEY_1,
  env.GEMINI_API_KEY_2,
  env.GEMINI_API_KEY_3,
  env.GEMINI_API_KEY_4,
  env.GEMINI_API_KEY_5
].filter(Boolean);

async function testKey(key: string, index: number, modelName: string) {
  const masked = key.substring(0, 6) + "..." + key.substring(key.length - 4);
  console.log("Testing [" + modelName + "] Key " + (index + 1) + ": " + masked);
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'OK'");
    const text = result.response.text().trim();
    console.log("[SUCCESS] Key " + (index + 1) + ": " + text);
    return true;
  } catch (err: any) {
    console.error("[FAILED] Key " + (index + 1) + " [" + modelName + "]: " + (err.status || err.message));
    return false;
  }
}

async function run() {
  console.log("Found " + keys.length + " keys to test...");
  for (let i = 0; i < keys.length; i++) {
    await testKey(keys[i], i, "gemini-1.5-flash");
    await testKey(keys[i], i, "gemini-2.0-flash");
  }
}

run();
