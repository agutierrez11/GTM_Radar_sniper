import { generateWithDeepSeek } from '../lib/deepseek';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function test() {
  console.log('--- Probando DeepSeek API Key ---');
  dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
  
  const key = process.env.DEEPSEEK_API_KEY;
  console.log(`Key: ${key ? 'Presente' : 'AUSENTE'}`);

  if (!key) return;

  try {
    const result = await generateWithDeepSeek('Hola, ¿quién eres? Responde en 10 palabras.');
    console.log('\n--- ÉXITO V3 ---');
    console.log(JSON.stringify(result, null, 2));
    
    // Test Reasoner (R1)
    const resultR1 = await generateWithDeepSeek('¿Cuál es la capital de Brasil? Responde en una palabra.', true);
    console.log('\n--- ÉXITO R1 ---');
    console.log(JSON.stringify(resultR1, null, 2));

  } catch (error) {
    console.error('\n--- ERROR ---');
    console.error(error instanceof Error ? error.message : error);
  }
}

test();
