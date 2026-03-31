const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixNowports() {
  // CORRECCIÓN: Quitar la tesis de fragmentación de pagos.
  // Nowports es Logistics Tech — sus señales son supply chain, nearshoring, financiamiento de carga.
  const { error } = await supabase
    .from('empresas_v2')
    .update({
      signal_context: "Nowports Capital consolidando financiamiento logístico para PyMEs | Pre-aprobación en 24 horas | Logistics World Summit & Expo 2026 | Amenaza: alianza Lounn + Finkargo en capa de capital importaciones.",
      segment_latamfintech: "Logistics Tech",
      competitors_verified: ["Lounn", "Finkargo", "Mundi", "Klog", "NuvoCargo"]
    })
    .eq('id', 7337);

  if (error) console.error('Error fixing Nowports:', error.message);
  else console.log('✅ Nowports corregido — señales de Logistics Tech solamente. Fragmentación de pagos removida.');
}

fixNowports();
