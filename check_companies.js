const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompanies() {
  const { data, error } = await supabase
    .from('empresas_v2')
    .select('*')
    .or('name.ilike.%Khipu%,name.ilike.%Nexxdi%');
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Resultados:', data);
  }
}

checkCompanies();
