const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function count() {
  const { count, error } = await supabase
    .from('empresas_v2')
    .select('*', { count: 'exact', head: true })
    .not('signal_context', 'is', null);

  if (error) {
    console.error("Error counting:", error);
    return;
  }

  console.log(`🚀 ESTATUS DEL ENJAMBRE:`);
  console.log(`Total empresas enriquecidas: ${count}`);
}

count();
