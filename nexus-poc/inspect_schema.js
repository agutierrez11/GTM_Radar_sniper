const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const supabaseKey = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  // 1. List all tables
  const { data: tables, error: e1 } = await supabase.rpc('get_tables'); // Custom RPC? If not found, try common names
  
  if (e1) {
    console.log('RPC get_tables failed, trying manual list...');
    const tableNames = [
      'empresas', 'empresas_v2', 'benchmark_raw', 'logs_busquedas', 
      'connections', 'relaciones', 'backup_empresas_utiles'
    ];
    
    for (const name of tableNames) {
      const { data, error } = await supabase.from(name).select('*').limit(1);
      if (!error) {
        console.log(`Table exists: ${name}`);
        // Get columns if possible (not easy via anon key unless info_schema exposed)
      } else {
        console.log(`Table not found or inaccessible: ${name} (${error.message})`);
      }
    }
  } else {
    console.log('Tables:', JSON.stringify(tables, null, 2));
  }
}

inspectSchema();
