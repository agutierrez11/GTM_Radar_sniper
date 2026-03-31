const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const supabaseKey = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getTopCompanies() {
  const { data, error } = await supabase
    .from('empresas_v2')
    .select('*')
    .not('description', 'is', null)
    .not('website', 'is', null)
    .limit(10);
    
  if (error) {
    console.error(error);
  } else {
    data.forEach(c => {
      console.log(`- ${c.name} (${c.country})`);
      console.log(`  Web: ${c.website}`);
      console.log(`  Descripción: ${c.description ? c.description.substring(0, 100) : ''}...`);
    });
  }
}

getTopCompanies();
