const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addShinkansen() {
  const data = {
    name: 'Shinkansen',
    website: 'https://shinkansen.finance',
    description: 'Infraestructura financiera agéntica para Latinoamérica. Automatización de tesorería y rieles de pago para Bancos y Fintechs.',
    country: 'Chile',
    vertical_finnovista: 'Paytech',
    product_category: 'Payouts & Treasury Automation',
    total_raised: 'Funding round 2022',
    markets_latam: ['Chile', 'Mexico', 'Peru'],
    segment_latamfintech: 'Paytech',
    strategic_notes: 'Venden rieles de pago directamente a Bancos y Fintechs para liberar ingenieros y automatizar movimientos de fondos.'
  };

  const { data: res, error } = await supabase.from('empresas_v2').insert(data).select('id').single();

  if (error) {
    console.error("❌ Error al insertar Shinkansen:", error.message);
  } else {
    console.log("✅ Shinkansen insertada con ID:", res.id);
  }
}

addShinkansen();
