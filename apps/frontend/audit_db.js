const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const supabaseKey = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  // Query 1: Column names and types (Using a workaround if info_schema is restricted)
  // We'll try to get one row and infer types or use a query if possible
  console.log('--- Query 1: Schema ---');
  const { data: cols, error: e1 } = await supabase.rpc('get_table_schema', { t_name: 'empresas_v2' });
  
  if (e1) {
    // If RPC fails, just show keys from a sample
    const { data: sample } = await supabase.from('empresas_v2').select('*').limit(1);
    if (sample && sample.length > 0) {
      console.log('Columns found (sample):', Object.keys(sample[0]));
    }
  } else {
    console.log(JSON.stringify(cols, null, 2));
  }

  // Query 2: Data Completeness
  console.log('--- Query 2: Completeness ---');
  // Since I can't run arbitrary SQL with the anon key easily unless an RPC exists, 
  // I will perform several count queries.
  
  const counts = {};
  
  const getCount = async (col) => {
    let query = supabase.from('empresas_v2').select('*', { count: 'exact', head: true });
    if (col) query = query.not(col, 'is', null);
    const { count } = await query;
    return count;
  };

  counts.total_empresas = await getCount(null);
  counts.con_nombre = await getCount('name');
  counts.con_pais = await getCount('country');
  counts.con_vertical = await getCount('vertical_finnovista');
  counts.con_descripcion = await getCount('description');
  counts.con_website = await getCount('website');

  console.log(JSON.stringify(counts, null, 2));
}

runAudit();
