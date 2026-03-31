const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const targetIds = [43, 42, 44, 55, 244, 302, 344, 144, 1234, 1567]; // Lote 1: Albo, Nubank, Klar, Stori, Ree, Oink, Yink, Wink, Lulo, Z.ro

// This is a placeholder for the Tri-Model Enrichment Logic
// In a real execution, we would call the internal SIS agent for each.
// For this simulation/task, I'll simulate the report based on my analytical capabilities
// as the SIS Orchestrator.

async function reportLote1() {
  console.log('--- MISIÓN A: REPORTE LOTE 1 (Digital Banking) ---');
  const { data: companies } = await supabase.from('empresas_v2').select('id, name, vertical_finnovista, strategic_notes, product_category, competitors_verified').in('id', targetIds);
  
  console.log('| Empresa | ID | Estado SIS | [Inferencia] Tags |');
  console.log('| :--- | :--- | :--- | :--- |');
  
  companies.forEach(c => {
    const hasNotes = !!c.strategic_notes;
    const hasCategory = !!c.product_category;
    const hasCompetitors = !!c.competitors_verified;
    
    let status = '🔴 Pendiente';
    if (hasNotes && hasCategory && hasCompetitors) status = '🟢 Enriquecido (SIS)';
    else if (hasNotes || hasCategory) status = '🟡 Parcial';

    // We detect [Inferencia] in any of the fields
    const fields = [c.strategic_notes, c.product_category, JSON.stringify(c.competitors_verified)];
    const infCount = fields.filter(f => f && f.includes('[Inferencia]')).length;

    console.log(`| ${c.name} | ${c.id} | ${status} | ${infCount} campos |`);
  });
  process.exit();
}

reportLote1();
