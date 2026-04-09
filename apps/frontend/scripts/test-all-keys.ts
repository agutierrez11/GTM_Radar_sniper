import { GoogleGenerativeAI } from "@google/generative-ai";

const keys = [
  "AIzaSyB3HH3olAREMGXzHkYwVJ7fX9IdmePn7EY",
  "AIzaSyAHjzGrHn-iucqSUdyAYYjBpF7g4kk7nBo",
  "AIzaSyAaJE3OHtPa-Xv87-q_rkCAYqQpzhJqp4A",
  "AIzaSyBW3cHVVErPKnh1QJkybADm-ltmZFrlruY",
  "AIzaSyDbZlVk3FHnrnXlhfXwE_pRat8Zdv2xdbg",
  "AIzaSyCCYzn2-5v_KYztyaQ0_AoKgfM55Cb62N8" // GCloud
];

async function testAll() {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Hi");
      console.log(`Key ${i+1} (${key.substring(0, 10)}...): ✅ SUCCESS`);
    } catch (e: any) {
      console.log(`Key ${i+1} (${key.substring(0, 10)}...): ❌ FAILED - Status: ${e.status} - Message: ${e.message.substring(0, 100)}...`);
    }
  }
}

testAll();
