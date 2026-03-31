const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function validate() {
  console.log("# REPORTE DE VALIDACIÓN: empresas_v2\n");

  // VALIDACIÓN 1: Primeras 50 empresas
  console.log("## 1. Primeras 50 empresas");
  const { data: q1 } = await supabase.from('empresas_v2').select('id, name, vertical_finnovista').order('id', { ascending: true }).limit(50);
  console.table(q1);

  // VALIDACIÓN 2: Sin vertical
  console.log("\n## 2. Sin vertical (o Unknown/Other)");
  const { data: q2 } = await supabase.from('empresas_v2')
    .select('id, name, vertical_finnovista')
    .or('vertical_finnovista.is.null,vertical_finnovista.eq."",vertical_finnovista.eq.Unknown,vertical_finnovista.eq.Other')
    .limit(20);
  console.table(q2);

  // VALIDACIÓN 3: Websites rotos
  console.log("\n## 3. Websites rotos o faltantes");
  const { data: q3 } = await supabase.from('empresas_v2')
    .select('id, name, website')
    .or('website.is.null,website.eq."",website.eq."N/A",website.eq."sin web"')
    .limit(20);
  // Note: PostgREST notation for "not like %http%" is tricky in JS client without rpc. 
  // Filtering the rest in JS.
  const q3Filtered = q3 ? q3.filter(w => !w.website || !w.website.includes('http')) : [];
  console.table(q3Filtered);

  // VALIDACIÓN 4 & 4B: Duplicados
  console.log("\n## 4 & 4B. Análisis de Duplicados (Nombre y Website)");
  const { data: all } = await supabase.from('empresas_v2').select('name, website');
  
  const nameCounts = {};
  const webCounts = {};
  
  all.forEach(row => {
    if (row.name) nameCounts[row.name] = (nameCounts[row.name] || 0) + 1;
    if (row.website && row.website !== '') webCounts[row.website] = (webCounts[row.website] || 0) + 1;
  });

  const dupNames = Object.entries(nameCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => ({ name, total }));

  const dupWebs = Object.entries(webCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([website, total]) => ({ website, total }));

  console.log("\n### Duplicados por Nombre:");
  console.table(dupNames.slice(0, 20));

  console.log("\n### Duplicados por Website:");
  console.table(dupWebs.slice(0, 20));
  
  console.log("\n✅ Auditoría Finalizada.");
}

validate();
