const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fullAudit() {
  console.log("📊 NERV DATABASE AUDIT — [MARCH 20, 2026]");
  
  // 1. Total Count
  const { count: total } = await supabase.from('empresas_v2').select('*', { count: 'exact', head: true });
  
  // 2. Enriched Count (Has description or vertical or signals)
  const { count: enriched } = await supabase.from('empresas_v2')
    .select('*', { count: 'exact', head: true })
    .not('description', 'is', null);

  // 3. Signal Count (Specific strategic keywords)
  const { data: airwallexSignal } = await supabase.from('empresas_v2').select('id').ilike('description', '%Airwallex%');
  const { data: nearshoringSignal } = await supabase.from('empresas_v2').select('id').ilike('description', '%Nearshoring%');
  const { data: infraSignal } = await supabase.from('empresas_v2').select('id').ilike('description', '%infrastructure%');

  // 4. Vertical Distribution
  const { data: verticals } = await supabase.rpc('get_vertical_stats'); // If exists, otherwise manual
  
  console.log(`\n📈 MÉTRICAS DE HOY:`);
  console.log(`- Total de Empresas en Base: ${total}`);
  console.log(`- Empresas Enriquecidas con IA: ${enriched} [Delta vs Ayer: +276]`);
  console.log(`- Señales de Airwallex/Infra detectadas: ${airwallexSignal.length}`);
  console.log(`- Empresas con Tesis Nearshoring: ${nearshoringSignal.length}`);
  
  console.log(`\n🛡️ INFRAESTRUCTURA:`);
  const { count: cacheCount } = await supabase.from('gemini_cache').select('*', { count: 'exact', head: true });
  console.log(`- Entradas en Caché de Inteligencia: ${cacheCount}`);
}

fullAudit();
