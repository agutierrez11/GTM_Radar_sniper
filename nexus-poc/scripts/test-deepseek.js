const { generateWithDeepSeek } = require('../src/lib/deepseek');
require('dotenv').config({ path: '.env.local' });

async function test() {
  console.log("🚀 Testing DeepSeek Integration...");
  try {
    const response = await generateWithDeepSeek("Hola, confirma que eres DeepSeek y que estás operativo para un motor de inteligencia GTM.");
    console.log("✅ DeepSeek Response:", response);
  } catch (err) {
    console.error("❌ DeepSeek Test Failed:", err);
  }
}

test();
