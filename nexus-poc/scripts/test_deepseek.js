require('dotenv').config({ path: '.env.local' });
const Anthropic = require('@anthropic-ai/sdk');

const deepseek = new Anthropic({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/anthropic'
});

async function testDeepSeek() {
  console.log('DEEPSEEK_API_KEY presente:', !!process.env.DEEPSEEK_API_KEY);
  console.log('Key prefix:', process.env.DEEPSEEK_API_KEY?.substring(0, 10) + '...');

  try {
    const msg = await deepseek.messages.create({
      model: 'deepseek-chat',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Responde solo: DEEPSEEK_OK' }]
    });
    console.log('DEEPSEEK STATUS: OK');
    console.log('Respuesta:', msg.content[0].text);
  } catch (e) {
    console.error('DEEPSEEK ERROR:', e.message);
  }
}

testDeepSeek();
