const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bwbatonvkfcjkfvhcwtc.supabase.co';
const supabaseKey = 'sb_publishable_KJi10IMU3rdr-byk06rbIg_kk4UMh74';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompanies() {
  const { data, error } = await supabase
    .from('empresas_v2')
    .select('*')
    .or('name.ilike.%Incode%,name.ilike.%Truora%,name.ilike.%Velafy%,name.ilike.%Shufti%')
    .limit(20);

  if (error) {
    console.error('Error fetching companies:', error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

checkCompanies();
