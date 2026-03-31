const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runDiagnostic() {
  console.log('--- Iniciando Diagnóstico de Supabase ---');
  try {
    const { count: total, error: errTotal } = await supabase
      .from('empresas_v2')
      .select('*', { count: 'exact', head: true });

    if (errTotal) throw new Error('Error al contar total: ' + errTotal.message);
    console.log(`Total de empresas: ${total}`);

    const fields = ['signal_context', 'strategic_notes', 'product_category', 'competitors_verified'];
    const results = {};

    for (const field of fields) {
      console.log(`Auditando campo: ${field}...`);
      
      // Separate counts for better debugging
      const { count: isNull, error: errNull } = await supabase
        .from('empresas_v2')
        .select('*', { count: 'exact', head: true })
        .is(field, null);
      if (errNull) throw new Error(`Error NULL en ${field}: ` + errNull.message);

      const { count: isEmptyStr, error: errEmpty } = await supabase
        .from('empresas_v2')
        .select('*', { count: 'exact', head: true })
        .eq(field, '');
      if (errEmpty) {
        // This might fail for JSONB, we catch it silently if it doesn't apply
        console.log(`  (Note: eq.'' not applicable for JSONB/Array field ${field})`);
      }

      const { count: isEmptyArray, error: errArray } = await supabase
        .from('empresas_v2')
        .select('*', { count: 'exact', head: true })
        .eq(field, '[]');
      if (errArray) {
        // This might fail for Text, we catch it silently
      }

      results[field] = (isNull || 0) + (isEmptyStr || 0) + (isEmptyArray || 0);
      console.log(`Resultado ${field}: ${results[field]} vacíos (Null: ${isNull}, Str: ${isEmptyStr || 0}, Array: ${isEmptyArray || 0})`);
    }

    console.log('--- Resumen Final ---');
    console.log(JSON.stringify({ total, results }, null, 2));
  } catch (e) {
    console.error('CRITICAL ERROR:', e.message);
  }
}

runDiagnostic();
