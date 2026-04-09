const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const supabaseKey = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRelationalTables() {
  const tables = ['connections', 'relaciones'];
  
  for (const name of tables) {
    const { data, error } = await supabase.from(name).select('*').limit(3);
    if (!error) {
      console.log(`--- ${name} ---`);
      console.log('Columns:', Object.keys(data[0] || {}));
      console.log('Data:', JSON.stringify(data, null, 2));
    } else {
      console.log(`Error in ${name}:`, error.message);
    }
  }
}

checkRelationalTables();
