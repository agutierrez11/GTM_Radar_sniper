const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLogistics() {
  const { count, error } = await supabase
    .from('empresas_logistics')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error checking empresas_logistics:', error.message);
    return;
  }

  console.log(`TOTAL_LOGISTICS_ENTITIES: ${count}`);
}

checkLogistics();
