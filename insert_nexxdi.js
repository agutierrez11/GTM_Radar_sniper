const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addCompany() {
  const { data, error } = await supabase
    .from('empresas_v2')
    .insert([
      { 
        name: 'Nexxdipay', 
        website: 'https://www.nexxdipay.com/',
        country: 'Mexico',
        source: 'manual_addition'
      }
    ])
    .select();
    
  if (error) {
    console.error('Error insertando Nexxdipay:', error);
  } else {
    console.log('✅ Nexxdipay agregado exitosamente:', data);
  }
}

addCompany();
