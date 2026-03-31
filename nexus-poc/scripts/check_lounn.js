const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLounn() {
  const { data, error } = await supabase
    .from('empresas_v2')
    .select('*')
    .ilike('name', '%Lounn%');

  if (error) {
    console.error('Error checking Lounn:', error.message);
    return;
  }

  console.log('LOUNN_SEARCH_RESULTS:', JSON.stringify(data, null, 2));
}

checkLounn();
