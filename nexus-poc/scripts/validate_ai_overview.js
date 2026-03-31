const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_PROFESSIONAL || process.env.GEMINI_API_KEY_1);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }, { apiVersion: "v1beta" });

const tools = [{ googleSearch: {} }];

async function validate() {
  console.log("🚀 INICIANDO VALIDACIÓN: 10 EMPRESAS DIGITAL BANKING\n");

  const { data: companies, error } = await supabase
    .from('empresas_v2')
    .select('*')
    .eq('vertical_finnovista', 'Digital Banking')
    .limit(10);

  if (error) {
    console.error("Error fetching companies:", error);
    return;
  }

  for (const company of companies) {
    try {
      console.log("------------------------------------------------------------------");
      console.log(`🏢 EMPRESA: ${company.name}`);
      console.log(`   [ANTES]`);
      console.log(`   - Competitors: ${JSON.stringify(company.competitors_verified)}`);
      console.log(`   - Product Cat: ${company.product_category}`);
      console.log(`   - Strategic Notes: ${company.strategic_notes?.substring(0, 50)}...`);
      console.log("\n   ⌛ Generando Enriquecimiento AI Overview...");

      // QUERY 1: Perfil & Competencia
      const q1Prompt = `Analiza la empresa: ${company.name} (${company.country}).
      Búscalo en Google Search para identificar:
      1. Lookalikes/Alternativas/Competidores directos.
      2. Categoría exacta de producto (Ej. BaaS, Neobank, Core Banking).
      3. Notas estratégicas: de qué trata su modelo de negocio (bullets).
      
      Retorna solo JSON:
      { "competitors": [], "category": "", "notes": "" }`;

      const q1Result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: q1Prompt }] }],
        tools
      });

      const q1Response = q1Result.response;
      const q1Text = q1Response.text().replace(/```json|```/g, "").trim();
      let q1Data = {};
      try { q1Data = JSON.parse(q1Text); } catch (e) { q1Data = { raw: q1Text }; }

      // QUERY 2: Lead Gen
      const comps = q1Data.competitors || [];
      const compsString = comps.length > 0 ? comps.slice(0, 3).join(" OR ") : company.name;
      const q2Prompt = `Busca: "${compsString} customers OR clients latam".
      Tu objetivo es encontrar nombres de empresas REALES que usen a estos competidores de ${company.name}.
      Retorna solo una lista de nombres en JSON: { "potential_leads": [] }`;

      const q2Result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: q2Prompt }] }],
        tools
      });

      const q2Text = q2Result.response.text().replace(/```json|```/g, "").trim();
      let q2Data = {};
      try { q2Data = JSON.parse(q2Text); } catch (e) { q2Data = { raw: q2Text }; }

      console.log(`   [DESPUÉS]`);
      console.log(`   - competitors_verified: ${JSON.stringify(q1Data.competitors)}`);
      console.log(`   - product_category: ${q1Data.category}`);
      console.log(`   - potential_leads: ${JSON.stringify(q2Data.potential_leads)}`);
      console.log(`   - FUENTES:`);
      console.log(`     Q1: ${q1Prompt.trim()}`);
      console.log(`     Q2: ${q2Prompt.trim()}`);
    } catch (companyError) {
      console.error(`❌ Error procesando ${company.name}:`, companyError.message);
    }
    console.log("------------------------------------------------------------------\n");
  }

  console.log("✅ VALIDACIÓN COMPLETADA.");
}

validate();
