const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function injectSignal() {
  const signal = {
    headline: "MexPago se integra al ecosistema Global de Airwallex",
    signals: [
      "Fase final de integración tecnológica con Airwallex Group completed.",
      "Infraestructura bancaria global con licencias en múltiples jurisdicciones.",
      "Foco en corredores US-Asia-México para cadenas de suministro globales."
    ],
    sentiment: "bullish",
    sources: [{ title: "LinkedIn Post - MexPago / Airwallex", url: "https://www.linkedin.com/" }],
    generated_at: new Date().toISOString()
  };

  console.log("🚀 Inyectando señal estratética para MexPago...");

  const { data, error } = await supabase
    .from('empresas_v2')
    .upsert({
      name: "MexPago",
      country: "Mexico",
      segment_latamfintech: "Payments / Infrastructure",
      signal_context: signal,
      description: "Infraestructura de pagos globales integrada al Airwallex Group. Conecta empresas mexicanas con rieles financieros globales licenciados.",
      has_full_data: true,
      icp_score: 95
    }, { onConflict: 'name' });

  if (error) {
    console.error("❌ Error inyectando señal:", error.message);
  } else {
    console.log("✅ Señal de MexPago inyectada con éxito.");
  }
}

injectSignal();
