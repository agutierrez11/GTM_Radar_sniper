const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function detailAudit() {
  console.log("🔍 DETALLE DE SEÑALES ESTRATÉGICAS:");
  
  const keywords = ['Nowports', 'MexPago', 'SPEI', 'Cross-border', 'Nearshoring', 'BaaS', 'Liquidez'];
  const mapping = {};

  for (const kw of keywords) {
    const { data, count } = await supabase.from('empresas_v2')
      .select('*', { count: 'exact', head: true })
      .or(`description.ilike.%${kw}%,signal_context.ilike.%${kw}%`);
    mapping[kw] = count;
  }

  console.log("MARKET_SIGNALS:", JSON.stringify(mapping, null, 2));

  console.log("\n📊 VERTICALES FINNOVISTA:");
  const { data: verticals } = await supabase
    .from('empresas_v2')
    .select('vertical_finnovista')
    .not('vertical_finnovista', 'is', null);
  
  const stats = {};
  verticals.forEach(v => {
    stats[v.vertical_finnovista] = (stats[v.vertical_finnovista] || 0) + 1;
  });
  console.log("VERTICAL_STATS:", JSON.stringify(stats, null, 2));

  console.log("\n🌍 PAÍSES (HOY):");
  const { data: countries } = await supabase
    .from('empresas_v2')
    .select('country')
    .not('country', 'is', null);
  
  const cStats = {};
  countries.forEach(c => {
    cStats[c.country] = (cStats[c.country] || 0) + 1;
  });
  console.log("COUNTRY_STATS:", JSON.stringify(cStats, null, 2));
}

detailAudit();
