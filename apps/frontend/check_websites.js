const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const supabaseKey = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWebsites() {
  const { data, error } = await supabase
    .from('empresas_v2')
    .select('name, website, vertical_finnovista')
    .not('website', 'is', null)
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('SAMPLES WITH WEBSITES:', JSON.stringify(data, null, 2));
}

checkWebsites();
