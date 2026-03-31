const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function addMissing() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const missing = [
    {
      name: 'Transbank',
      website: 'https://www.transbank.cl',
      description: 'Principal adquirente de Chile. Operador de tarjetas de crédito y débito.',
      country: 'Chile',
      vertical_finnovista: 'Paytech',
      product_category: 'Acquiring & Payments',
      segment_latamfintech: 'Paytech',
      markets_latam: ['Chile']
    },
    {
      name: 'BciPagos',
      website: 'https://www.bcipagos.cl',
      description: 'Joint venture entre Bci y EVO Payments. Adquirencia bancaria en Chile.',
      country: 'Chile',
      vertical_finnovista: 'Paytech',
      product_category: 'Acquiring & Payments',
      segment_latamfintech: 'Paytech',
      markets_latam: ['Chile']
    },
    {
      name: 'B-Pago',
      website: 'https://www.bpago.cl',
      description: 'Operador de servicios de pago y adquirencia en Chile.',
      country: 'Chile',
      vertical_finnovista: 'Paytech',
      product_category: 'Acquiring & Payments',
      segment_latamfintech: 'Paytech',
      markets_latam: ['Chile']
    },
    {
      name: 'Guavapay',
      website: 'https://guavapay.com',
      description: 'Plataforma global de pagos y adquirencia con foco en transfronterizos.',
      country: 'UK',
      vertical_finnovista: 'Paytech',
      product_category: 'Cross-border Payments',
      segment_latamfintech: 'Paytech',
      markets_latam: ['Mexico', 'Colombia', 'Chile', 'Peru', 'Brazil']
    }
  ];

  console.log("🚀 Insertando 4 adquirentes faltantes...");

  for (const company of missing) {
    const { data, error } = await supabase.from('empresas_v2').insert(company).select('id').single();
    if (error) {
      console.error(`❌ Error con ${company.name}:`, error.message);
    } else {
      console.log(`✅ ${company.name} insertada con ID: ${data.id}`);
    }
  }
}

addMissing();
