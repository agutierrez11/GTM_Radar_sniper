const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function matchElevenLabs() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("🔍 Ejecutando Matching Interno para ElevenLabs...");

  // 1. ElevenAgents Target: Fintechs / Bancos / Retail con mucho Customer Care
  const { data: agentsTargets } = await supabase
    .from('empresas_v2')
    .select('name, description, product_category')
    .or('product_category.ilike.%Fintech%,product_category.ilike.%Banking%,product_category.ilike.%Retail%,product_category.ilike.%E-commerce%')
    .limit(10);

  // 2. ElevenCreative Target: Marketing / Creadores / Media
  const { data: creativeTargets } = await supabase
    .from('empresas_v2')
    .select('name, description, product_category')
    .or('vertical_finnovista.ilike.%Marketing%,product_category.ilike.%Media%,product_category.ilike.%Content%')
    .limit(5);

  // 3. ElevenAPI Target: Otros SaaS / AI Infra
  const { data: apiTargets } = await supabase
    .from('empresas_v2')
    .select('name, description, product_category')
    .or('vertical_finnovista.ilike.%AI%,product_category.ilike.%SaaS%,product_category.ilike.%Infrastructure%')
    .limit(5);

  console.log("\n🎯 ElevenAgents — Target: Customer Experience");
  agentsTargets.forEach(t => console.log(`- ${t.name}: ${t.product_category}`));

  console.log("\n🎨 ElevenCreative — Target: Creators & Marketing");
  creativeTargets.forEach(t => console.log(`- ${t.name}: ${t.product_category}`));

  console.log("\n🛠️ ElevenAPI — Target: Developers & AI Infrastructure");
  apiTargets.forEach(t => console.log(`- ${t.name}: ${t.product_category}`));
}

matchElevenLabs();
