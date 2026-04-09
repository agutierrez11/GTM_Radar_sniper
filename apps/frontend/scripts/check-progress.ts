import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkProgress() {
  const { count: total } = await supabase
    .from('empresas_v2')
    .select('*', { count: 'exact', head: true });

  const { count: withDescription } = await supabase
    .from('empresas_v2')
    .select('*', { count: 'exact', head: true })
    .not('description', 'is', null)
    .neq('description', '');

  const { count: withWebsite } = await supabase
    .from('empresas_v2')
    .select('*', { count: 'exact', head: true })
    .not('website', 'is', null)
    .neq('website', '');

  const { count: fullData } = await supabase
    .from('empresas_v2')
    .select('*', { count: 'exact', head: true })
    .eq('has_full_data', true);

  const { count: posHardware } = await supabase
    .from('empresas_v2')
    .select('*', { count: 'exact', head: true })
    .eq('segment_latamfintech', 'Hardware POS');

  const pct = total ? ((withDescription! / total) * 100).toFixed(1) : '0';

  console.log('\n📊 NERV Enjambre — Estado Real del Ecosistema');
  console.log('─'.repeat(45));
  console.log(`🏢 Total empresas:           ${total}`);
  console.log(`📝 Con descripción:          ${withDescription} (${pct}%)`);
  console.log(`🌐 Con website:              ${withWebsite}`);
  console.log(`✅ has_full_data = true:     ${fullData}`);
  console.log(`🖥️  Hardware POS insertadas:  ${posHardware}`);
  console.log('─'.repeat(45));
  console.log(`⏳ Pendientes de enriquecer: ${total! - withDescription!}`);
}

checkProgress();
