const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function qualityCheck() {
  console.log("🛡️ NERV DATA QUALITY AUDIT:");
  
  // 1. Nombres demasiado largos (> 60 caracteres)
  const { data: longNames, count: longCount } = await supabase.from('empresas_v2')
    .select('name')
    .gt('name.length', 60);

  // 2. Nombres con "http" or "www" (URLs en lugar de nombres)
  const { data: urls, count: urlCount } = await supabase.from('empresas_v2')
    .select('name')
    .or('name.ilike.%http%,name.ilike.%www%');

  // 3. Muestra de los últimos 20 insertados
  const { data: latest } = await supabase.from('empresas_v2')
    .select('name, country, vertical_finnovista')
    .order('id', { ascending: false })
    .limit(20);

  console.log(`\n📊 RESULTADOS:`);
  console.log(`- Sospechosos por longitud (>60 chars): ${longCount || 0}`);
  if (longNames && longNames.length > 0) console.log("Ejemplos:", longNames.map(n => n.name).slice(0, 5));

  console.log(`- Sospechosos por ser URLs: ${urlCount || 0}`);
  if (urls && urls.length > 0) console.log("Ejemplos:", urls.map(n => n.name).slice(0, 5));

  console.log(`\n📦 ÚLTIMOS 20 INSERTADOS (Muestra Real):`);
  latest.forEach((c, i) => {
    console.log(`${i+1}. ${c.name} [${c.country || '?'}] - ${c.vertical_finnovista || 'Sin Vertical'}`);
  });
}

qualityCheck();
