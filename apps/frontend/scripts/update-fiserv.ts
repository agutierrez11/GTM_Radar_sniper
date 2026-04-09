import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { error } = await sb
    .from('empresas_v2')
    .update({
      segment_latamfintech: 'Infrastructure + POS',
      strategic_notes: 'Leading indicator — Infraestructura que verticalizó hacia POS via adquisición de Clover. Modelo a monitorear para Latam.',
      market_share_pct: 2.96
    })
    .eq('name', 'Fiserv');

  if (error) console.error('❌ Error:', error.message);
  else console.log('✅ Fiserv actualizada: segment=Infrastructure + POS, market_share_pct=2.96');
}

run();
