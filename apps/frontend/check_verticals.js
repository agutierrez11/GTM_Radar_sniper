const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const supabaseKey = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCrypto() {
  const { data, error } = await supabase
    .from('empresas_v2')
    .select('name, vertical_finnovista, country')
    .eq('country', 'Colombia')
    .ilike('vertical_finnovista', '%Crypto%')
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('CRYPTO CO:', JSON.stringify(data, null, 2));

  const { data: wealth, error: e2 } = await supabase
    .from('empresas_v2')
    .select('name, vertical_finnovista, country')
    .eq('country', 'Colombia')
    .ilike('vertical_finnovista', '%Wealth%')
    .limit(10);

  console.log('WEALTH CO:', JSON.stringify(wealth, null, 2));
}

checkCrypto();
