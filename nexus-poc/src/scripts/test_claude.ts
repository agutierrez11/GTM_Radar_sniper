import { generateWithClaude } from '../lib/claude';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env.local explícitamente
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function test() {
  console.log('--- Probando Claude API Key ---');
  console.log('Key:', process.env.ANTHROPIC_API_KEY ? 'Presente (Mascara: ' + process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...)' : 'FALTANTE');

  const mockBrief = {
    empresa: "EBANX",
    producto: "Soluciones de Pago",
    pais: "Brasil",
    vertical: "Payments",
    tier: "Tier1"
  };

  try {
    const result = await generateWithClaude(mockBrief);
    console.log('\n--- ÉXITO ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('\n--- ERROR ---');
    console.error(error.message || error);
  }
}

test();
