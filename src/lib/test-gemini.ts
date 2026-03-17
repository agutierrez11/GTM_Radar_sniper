import { generateWithFallback } from './gemini';

async function test() {
  console.log("Test 1 — JSON response:");
  const r1 = await generateWithFallback(
    'Devuelve exactamente este JSON: {"test": true, "score": 42}'
  );
  console.log("cached:", r1.cached);
  console.log("data:", r1.data);
  console.log("tipo:", typeof r1.data);
  
  console.log("\nTest 2 — Cache hit:");
  const r2 = await generateWithFallback(
    'Devuelve exactamente este JSON: {"test": true, "score": 42}'
  );
  console.log("cached:", r2.cached); // debe ser TRUE
  console.log("data:", r2.data);

  console.log("\nTest 4 — Texto plano:"); // Corregí el número del test en el log para que coincida con el reporte
  const r3 = await generateWithFallback(
    'Di solo: hola mundo'
  );
  console.log("cached:", r3.cached);
  console.log("data:", r3.data);
  console.log("tipo:", typeof r3.data);
}

test().catch(console.error);
