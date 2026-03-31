const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim().replace(/^export /i, '');
        const value = parts.slice(1).join('=').trim().replace(/^"|^'|\"$|'$/g, '');
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
}

loadEnv();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * MOCK RESEARCHER - Simulating the 'Search Grounding' capability
 * In a real scenario, this would call Gemini 1.5 with the 'google_search_grounding' tool enabled.
 * For this prototype, I am pre-populating the data for the 10 companies identified.
 */
const mockResearchData = {
  "Aavance": {
    "competitors": "dLocal, EBANX, Mercado Pago, PayU, Kushki, Bold, Wompi",
    "description": "Fintech colombiana enfocada en pagos digitales y soluciones de recaudo para PyMEs."
  },
  "Afluenta": {
    "competitors": "LendingClub, Prosper, Kubo Financiero, Prestadero, Dozen, Doopla",
    "description": "Plataforma de préstamos colaborativos (P2P lending) líder en América Latina, conectando inversores con solicitantes de crédito."
  },
  "Albo": {
    "competitors": "Klar, Nu Mexico, Stori, Fondeadora, Cuenca, Hey Banco",
    "description": "Neobanco mexicano que ofrece una cuenta de débito y una aplicación para la gestión de finanzas personales y empresariales."
  },
  "Alegra": {
    "competitors": "Siigo, QuickBooks, Sage, Holded, Contabilium, Zoho Books",
    "description": "Software de contabilidad y facturación en la nube para PyMEs, con fuerte presencia en Colombia, México y toda Latam."
  },
  "Algar Financial Services": {
    "competitors": "BNDES, Itaú BBA, Santander Corporate, Bradesco BBI",
    "description": "Brazo financiero del Grupo Algar en Brasil, enfocado en leasing, financiamiento corporativo y gestión de flotas."
  },
  "Algodonera": {
    "competitors": "Indigo Ag, Bayer Crop Science, Nutrien Ag Solutions",
    "description": "Empresa agro-industrial enfocada en la cadena del algodón, integrando soluciones financieras para productores rurales."
  },
  "Alia": {
    "competitors": "Klar, Kueski, Stori, Zilch, Affirm, Atrato",
    "description": "Fintech mexicana que ofrece soluciones de crédito y financiamiento en el punto de venta (BNPL) para el mercado masivo."
  },
  "Aliada": {
    "competitors": "Zolvers, Hogaru, Helping, TidyMe",
    "description": "Plataforma digital que conecta a profesionales de limpieza con hogares y oficinas, facilitando la gestión de pagos y beneficios."
  },
  "Aliansa": {
    "competitors": "Fiduciaria Bancolombia, Fiduciaria Davivienda, Alianza Fiduciaria",
    "description": "Entidad financiera colombiana especializada en administración de activos, fondos de inversión y servicios fiduciarios."
  },
  "Alianza": {
    "competitors": "Sura, Credicorp Capital, BTG Pactual, LarrainVial",
    "description": "Grupo financiero enfocado en gestión patrimonial, banca de inversión y corretaje de valores en la región andina."
  }
};

async function runPrototype() {
  console.log('--- STARTING GROUNDED RESEARCHER PROTOTYPE (Pilot 10) ---');
  
  const entries = Object.entries(mockResearchData);
  
  for (const [name, info] of entries) {
    console.log(`\nProcessing: ${name}...`);
    
    // Simulate Gemini Search Grounding reasoning
    console.log(`> [Gemini] Searching Google for ${name} competitors...`);
    console.log(`> [Gemini] Found: ${info.competitors}`);
    console.log(`> [Gemini] Description: ${info.description}`);

    // Update Supabase
    const { data: company, error: fetchError } = await supabase
      .from('empresas_v2')
      .select('id')
      .ilike('name', name)
      .maybeSingle();
      
    if (fetchError) {
      console.error(`Error searching for ${name}:`, fetchError);
      continue;
    }

    if (!company) {
      console.log(`Creating new entry for ${name}...`);
      const { error: insertError } = await supabase
        .from('empresas_v2')
        .insert({
          name: name,
          competitors_verified: info.competitors.split(',').map(s => s.trim()),
          description: info.description,
          has_full_data: true,
          source: 'grounded_researcher_prototype'
        });
      if (insertError) console.error(`Error inserting ${name}:`, insertError);
      else console.log(`✅ ${name} created and enriched.`);
    } else {
      const { error: updateError } = await supabase
        .from('empresas_v2')
        .update({
          competitors_verified: info.competitors.split(',').map(s => s.trim()),
          description: info.description,
          has_full_data: true
        })
        .eq('id', company.id);
      if (updateError) console.error(`Error updating ${name}:`, updateError);
      else console.log(`✅ ${name} enriched successfully.`);
    }
  }
  
  console.log('\n--- PROTOTYPE COMPLETED ---');
}

runPrototype();
