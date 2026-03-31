const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function enrichCompetitiveIntel() {
  console.log('🚀 Iniciando Enriquecimiento de Inteligencia Competitiva...');

  // 1. Update LOUNN (id 2420)
  const lounnUpdate = {
    signal_context: "Aliado estratégico de Finkargo para financiamiento de importaciones. Compite indirectamente con Nowports en la capa de capital para trade finance. Tesis: Fragmentación regional mitigada vía orquestación de capital.",
    competitors_verified: ["Nowports", "Mundi", "Finkargo", "Solvento"],
    product_category: "Import Financing / SME Credit"
  };

  const { error: err1 } = await supabase
    .from('empresas_v2')
    .update(lounnUpdate)
    .eq('name', 'Lounn'); // Using name just in case ID is different

  if (err1) console.error('Error updating Lounn:', err1.message);
  else console.log('✅ Lounn actualizado con éxito.');

  // 2. Update NOWPORTS (id 7337)
  const nowportsUpdate = {
    signal_context: "Unicornio de Logtech. Amenaza emergente en financiamiento puro por la alianza Lounn+Finkargo. Tesis de mercado: El flujo de $70B en OXXO Pay y $80B en Pix genera una fragmentación que Nowports intenta consolidar.",
    competitors_verified: ["Lounn", "Finkargo", "Mundi", "Klog", "NuvoCargo"],
    segment_latamfintech: "Logistics Tech"
  };

  const { error: err2 } = await supabase
    .from('empresas_v2')
    .update(nowportsUpdate)
    .eq('id', 7337);

  if (err2) console.error('Error updating Nowports:', err2.message);
  else console.log('✅ Nowports actualizado con éxito.');
}

enrichCompetitiveIntel();
