import './load-env';
import { enrichCompany } from '../src/lib/enrichment';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const MAX_COMPANIES_PER_CYCLE = 200;
const MAX_CONSECUTIVE_ERRORS = 5;
const INTER_CYCLE_DELAY_MS = 10000; // 10s de descanso entre ciclos

async function runCycle(cycleNum: number): Promise<{ enriched: number; total: number; done: boolean }> {
  console.log(`\n🔄 === CICLO ${cycleNum} INICIADO ===`);
  let offset = 0;
  let hasMore = true;
  let consecutiveErrors = 0;
  const summary = { enriched: 0, failed: 0, skipped: 0, total: 0 };

  while (hasMore) {
    if (summary.total >= MAX_COMPANIES_PER_CYCLE) break;

    console.log(`📡 Solicitando lote: [${offset} - ${offset + 50}]...`);

    const { data: companies, error } = await supabase
      .from('empresas_v2')
      .select('*')
      .or('description.is.null,vertical_finnovista.is.null,website.is.null')
      .order('id', { ascending: true })
      .range(offset, offset + 49);

    if (error) { console.error("❌ Error cargando lote:", error.message); break; }
    if (!companies || companies.length === 0) {
      console.log("🏁 No hay más empresas pendientes. ¡Ecosistema completo!");
      return { ...summary, done: true };
    }

    console.log(`📦 Procesando ${companies.length} empresas...`);

    for (const company of companies) {
      if (summary.total >= MAX_COMPANIES_PER_CYCLE) break;

      summary.total++;
      const result = await enrichCompany(company);
      console.log(`[C${cycleNum}:${summary.total}] ${result.log}`);

      if (result.success) {
        summary.enriched++;
        consecutiveErrors = 0;
      } else if (result.log.includes("❌")) {
        summary.failed++;
        consecutiveErrors++;
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          console.log("🛑 Jidoka: Demasiados errores consecutivos. Pausando ciclo.");
          hasMore = false;
          break;
        }
      } else {
        summary.skipped++;
      }

      await new Promise(resolve => setTimeout(resolve, 4000));
    }

    if (!hasMore) break;
    offset += 50;
    if (companies.length < 50) hasMore = false;
    else {
      console.log("⏳ Esperando 5s antes del siguiente lote...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log(`\n--- 🏁 CICLO ${cycleNum} COMPLETADO ---`);
  console.log(`✅ Enriquecidas: ${summary.enriched} | ❌ Fallidas: ${summary.failed} | ⏩ Skipped: ${summary.skipped}`);
  return { ...summary, done: false };
}

async function runContinuous() {
  console.log("🚀 NERV Enjambre Continuo — Modo 200x200");
  console.log("🛡️  Candados: Jidoka(5) + 4s/empresa + 10s entre ciclos\n");

  let cycle = 1;
  let totalEnriched = 0;

  while (true) {
    const result = await runCycle(cycle);
    totalEnriched += result.enriched;

    if (result.done) {
      console.log(`\n🎉 ECOSISTEMA COMPLETO. Total enriquecidas en esta sesión: ${totalEnriched}`);
      break;
    }

    console.log(`\n⏳ Descansando ${INTER_CYCLE_DELAY_MS / 1000}s antes del ciclo ${cycle + 1}...`);
    await new Promise(resolve => setTimeout(resolve, INTER_CYCLE_DELAY_MS));
    cycle++;
  }
}

runContinuous();


async function runBatchEnrich() {
  console.log("🚀 Iniciando Enjambre de Enriquecimiento Recurrente...");
  
  let offset = 0;
  let hasMore = true;
  let consecutiveErrors = 0;
  const MAX_COMPANIES_PER_RUN = 200;
  const MAX_CONSECUTIVE_ERRORS = 5;
  const summary = { enriched: 0, failed: 0, skipped: 0, total: 0, stopReason: "Finalizado" };

  while (hasMore) {
    if (summary.total >= MAX_COMPANIES_PER_RUN) {
      summary.stopReason = "Límite de seguridad alcanzado (100 empresas)";
      break;
    }

    console.log(`📡 Solicitando lote: [${offset} - ${offset + 50}]...`);
    
    // 1. Obtener empresas incompletas con offset
    const { data: companies, error } = await supabase
      .from('empresas_v2')
      .select('*')
      .or('description.is.null,vertical_finnovista.is.null,website.is.null')
      .order('id', { ascending: true })
      .range(offset, offset + 49);

    if (error) {
      console.error("❌ Error cargando lote:", error.message);
      break;
    }

    if (!companies || companies.length === 0) {
      console.log("🏁 No hay más empresas para procesar.");
      hasMore = false;
      break;
    }

    console.log(`📦 Procesando ${companies.length} empresas en este lote...`);

    for (const company of companies) {
      if (summary.total >= MAX_COMPANIES_PER_RUN) break;

      summary.total++;
      const result = await enrichCompany(company);
      console.log(`[${summary.total}] ${result.log}`);

      if (result.success) {
        summary.enriched++;
        consecutiveErrors = 0; // Reset
      } else if (result.log.includes("❌")) {
        summary.failed++;
        consecutiveErrors++;
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          summary.stopReason = "Jidoka: Demasiados errores consecutivos (5)";
          hasMore = false;
          break;
        }
      } else {
        summary.skipped++;
      }

      // Rate limit individual: 4s (Optimizado para Arsenal 3.0 Free Tier)
      await new Promise(resolve => setTimeout(resolve, 4000));
    }

    if (!hasMore) break;

    // 2. Incrementar offset y esperar entre batches
    offset += 50;
    if (companies.length < 50) {
      hasMore = false;
    } else {
      console.log("⏳ Batch completado. Esperando 5s para el siguiente...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log("\n--- 🏁 RESUMEN FINAL ---");
  console.log(`📌 Motivo de parada: ${summary.stopReason}`);
  console.log(`📊 Procesadas: ${summary.total}`);
  console.log(`✅ Enriquecidas: ${summary.enriched}`);
  console.log(`❌ Fallidas: ${summary.failed}`);
  console.log(`⏩ Skipped: ${summary.skipped}`);
  console.log("------------------------");
}

runBatchEnrich();
