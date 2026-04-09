import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  // 1. Check if market_share_pct column exists
  const { data: colCheck, error: colError } = await sb
    .from('empresas_v2')
    .select('market_share_pct')
    .limit(1);

  if (colError?.message?.includes("column") || colError?.message?.includes("market_share_pct")) {
    console.log('\n❌ COLUMNA market_share_pct: NO EXISTE — Necesitas ejecutar el ALTER TABLE en Supabase Dashboard.');
  } else {
    console.log('\n✅ COLUMNA market_share_pct: EXISTE');
  }

  // 2. Check Hardware POS rows
  const { data: posRows, error: posError } = await sb
    .from('empresas_v2')
    .select('name, segment_latamfintech')
    .or("segment_latamfintech.eq.Hardware POS,name.eq.PAX Global Technology,name.eq.Ingenico,name.eq.Verifone")
    .limit(5);

  if (posError) {
    console.error('\n❌ Error consultando Hardware POS:', posError.message);
  } else if (!posRows || posRows.length === 0) {
    console.log('\n⚠️  Hardware POS rows: 0 encontradas — Los INSERTs aún no se han ejecutado.');
  } else {
    console.log(`\n✅ Hardware POS rows encontradas: ${posRows.length}`);
    console.table(posRows);
  }
}

run();
