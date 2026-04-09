const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const supabaseKey = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL() {
  let allData = [];
  let step = 1000;
  for (let i = 0; i < 10000; i += step) {
    const { data, error } = await supabase
      .from('empresas_v2')
      .select('name, website, description, vertical_finnovista, country, icp_score')
      .range(i, i + step - 1);
      
    if (error) break;
    if (data.length === 0) break;
    allData.push(...data);
  }

  const targetCompanies = allData.filter(d => 
    d.website && d.website.trim() !== '' && 
    (!d.description || d.description.trim() === '')
  );

  console.log(`\n=== EMPRESAS CON WEBSITE Y SIN DESCRIPCION ===`);
  console.log(`TOTAL: ${targetCompanies.length}`);
}

runSQL();
