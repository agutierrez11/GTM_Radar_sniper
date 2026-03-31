const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function auditQuality() {
  console.log("🔍 AUDITANDO CALIDAD PARA DEMO 1 PM...");

  // 1. Buscar placeholders comunes
  const placeholders = ['[PENDIENTE]', '[ERROR]', '[COMPLETAR]', '...', 'TBD', 'N/A'];
  
  for (const p of placeholders) {
    const { data, count } = await supabase
      .from('empresas_v2')
      .select('id, name', { count: 'exact' })
      .or(`description.ilike.%${p}%,signal_context.ilike.%${p}%,strategic_notes.ilike.%${p}%`);
    
    if (count > 0) {
      console.log(`⚠️  Encontrados ${count} registros con el placeholder "${p}":`);
      data.slice(0, 5).forEach(d => console.log(`   - ${d.name} (ID: ${d.id})`));
    }
  }

  // 2. Buscar empresas sin vertical (crítico para el UI mapping)
  const { count: noVertical } = await supabase
    .from('empresas_v2')
    .select('id', { count: 'exact', head: true })
    .is('vertical_finnovista', null);
  
  if (noVertical > 0) {
    console.log(`⚠️  ${noVertical} empresas no tienen 'vertical_finnovista' asignado.`);
  }

  // 3. Buscar descripciones vacías o muy cortas
  const { data: shortDesc, count: shortCount } = await supabase
    .from('empresas_v2')
    .select('id, name, description')
    .not('description', 'is', null);

  const veryShort = shortDesc.filter(d => d.description.length < 20);
  if (veryShort.length > 0) {
    console.log(`⚠️  ${veryShort.length} empresas tienen descripciones sospechosamente cortas (< 20 chars).`);
    veryShort.slice(0, 5).forEach(d => console.log(`   - ${d.name}: "${d.description}"`));
  }

  // 4. Verificar Nowports (ID 7337) específicamente
  const { data: nowports } = await supabase
    .from('empresas_v2')
    .select('name, segment_latamfintech, signal_context')
    .eq('id', 7337)
    .single();
  
  console.log(`\n✅ ESTADO CRÍTICO (Nowports):`);
  console.log(`   - Nombre: ${nowports?.name}`);
  console.log(`   - Segmento: ${nowports?.segment_latamfintech}`);
  console.log(`   - Tesis: ${nowports?.signal_context ? 'PRESENTE' : 'AUSENTE'}`);

  console.log("\nFin de auditoría.");
}

auditQuality();
