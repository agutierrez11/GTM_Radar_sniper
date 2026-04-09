const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const supabaseKey = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSampleData() {
  const tableNames = [
    'empresas', 'empresas_v2', 'benchmark_raw', 'logs_busquedas', 
    'connections', 'relaciones', 'backup_empresas_utiles'
  ];
  
  for (const name of tableNames) {
    const { data, error } = await supabase.from(name).select('*').limit(1);
    if (!error && data.length > 0) {
      console.log(`--- ${name} ---`);
      console.log(JSON.stringify(Object.keys(data[0]), null, 2));
      console.log('Sample:', JSON.stringify(data[0], null, 2));
    } else {
      console.log(`--- ${name} --- Empty or Error: ${error?.message}`);
    }
  }
}

checkSampleData();
