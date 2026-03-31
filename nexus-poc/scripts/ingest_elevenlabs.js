const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function ingestElevenLabs() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const elevenLabs = {
    name: 'ElevenLabs',
    website: 'https://elevenlabs.io',
    description: 'Plataforma líder de audio e IA con tres pilares: ElevenAgents (B2B/Customer Experience), ElevenCreative (Creadores/Marketing) y ElevenAPI (Desarrolladores). Enfoque en alta fidelidad y multilingüismo.',
    country: 'Global / USA / Europe',
    vertical_finnovista: 'AI / Audio / Enterprise SaaS',
    product_category: 'AI Agents & Audio Infrastructure',
    strategic_notes: 'Cultura de alta velocidad y AI-first. Expansión agresiva a LATAM 2026. Nodo maestro en el Grafo de Inteligencia de NERV para la vertical de Media & GenAI.'
  };

  console.log("🚀 Ingiriendo ElevenLabs en el SIS de NERV...");

  const { data, error } = await supabase.from('empresas_v2').insert(elevenLabs).select('id').single();
  
  if (error) {
    console.error("❌ Error al ingeniar ElevenLabs:", error.message);
  } else {
    console.log(`✅ ElevenLabs registrado con ID: ${data.id}. Sistema de Comando actualizado.`);
  }
}

ingestElevenLabs();
