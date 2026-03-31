import { generateWithGroq } from '../lib/groq';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function test() {
  console.log('--- Probando Groq API Key ---');
  dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
  
  const key = process.env.GROQ_API_KEY;
  console.log(`Key: ${key ? 'Presente' : 'AUSENTE'}`);

  if (!key) return;

  try {
    const result = await generateWithGroq('Hola, ¿quién eres? Responde en JSON con un campo "respuesta" de 10 palabras.');
    console.log('\n--- ÉXITO GROQ ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n--- ERROR ---');
    console.error(error instanceof Error ? error.message : error);
  }
}

test();
