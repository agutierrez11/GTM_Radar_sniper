const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkMap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const mapCompanies = [
    'Redeban', 'Credibanco', 'Movii', 'Openpay', 'Bold', 'SumUp', 
    'Worldpay', 'Kushki', 'PagSeguro', 'Nuvei', 'Ecopaynet', 
    'Akua', 'Kiire', 'Kamin', 'Transbank', 'Klap', 'Getnet', 
    'BciPagos', 'Flow', 'B-Pago', 'EBANX', 'dLocal', 'PayU', 
    'PayRetailers', 'Monnet', 'Rebill', 'Guavapay', 'Bamboo', 
    'PPRO', 'Prometeo'
  ];

  console.log("🔍 Verificando adquirentes del mapa en NERV...");

  const results = await Promise.all(mapCompanies.map(async (name) => {
    const { data } = await supabase.from('empresas_v2')
      .select('id')
      .ilike('name', `%${name}%`);
    return { name, exists: data && data.length > 0 };
  }));

  const missing = results.filter(r => !r.exists).map(r => r.name);
  const found = results.filter(r => r.exists).map(r => r.name);

  console.log(`✅ Encontradas (${found.length}): ${found.join(', ')}`);
  console.log(`❌ Faltantes (${missing.length}): ${missing.join(', ')}`);
}

checkMap();
