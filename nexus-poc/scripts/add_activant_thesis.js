const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function addActivantThesis() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const companies = [
    {
      name: 'Bridge',
      website: 'https://bridge.xyz',
      description: 'Orquestación de infraestructura para pagos con stablecoins. API unificada para mover dinero globalmente.',
      country: 'USA / Global',
      vertical_finnovista: 'Infrastructure / Paytech',
      product_category: 'Infrastructure Orchestration',
      strategic_notes: 'Alta Innovación y Crecimiento según Activant. Nodo crítico para pagos B2B con stablecoins.'
    },
    {
      name: 'BVNK',
      website: 'https://www.bvnk.com',
      description: 'Plataforma de pagos cripto para empresas. Puente entre TradFi y criptoactivos.',
      country: 'UK / Global',
      vertical_finnovista: 'Infrastructure / Paytech',
      product_category: 'Infrastructure Orchestration',
      strategic_notes: 'Cámara de compensación y gateway para negocios globales en el ecosistema Activant.'
    },
    {
      name: 'Fipto',
      website: 'https://www.fipto.com',
      description: 'Solución B2B para pagos transfronterizos y gestión de tesorería con activos digitales.',
      country: 'Francia / Global',
      vertical_finnovista: 'Infrastructure / Paytech',
      product_category: 'Infrastructure Orchestration',
      strategic_notes: 'Especialista en tesorería corporativa y pagos de aviación/negocios.'
    },
    {
      name: 'Nium',
      website: 'https://www.nium.com',
      description: 'Plataforma global de pagos que permite a las empresas desembolsar fondos en tiempo real.',
      country: 'Singapore / Global / Latam',
      vertical_finnovista: 'Paytech',
      product_category: 'Remittance & C2C XB Applications',
      strategic_notes: 'Alta convicción de crecimiento. Red masiva de pagos en mercados emergentes.'
    },
    {
      name: 'Thunes',
      website: 'https://www.thunes.com',
      description: 'Red global de pagos transfronterizos enfocada en mercados de LATAM, África y Asia.',
      country: 'Global / Latam',
      vertical_finnovista: 'Paytech',
      product_category: 'Remittance & C2C XB Applications',
      strategic_notes: 'Interoperabilidad global. Clave para el mapa de adquirencia masivo.'
    },
    {
      name: 'Melio',
      website: 'https://www.meliopayments.com',
      description: 'Gestión de cuentas por pagar y cobrar para PyMEs, simplificando pagos B2B.',
      country: 'USA / Global',
      vertical_finnovista: 'Paytech / B2B',
      product_category: 'B2B Payment Applications',
      strategic_notes: 'Enfoque en PyMEs. Alta innovación en experiencia de usuario de pagos.'
    },
    {
      name: 'Deel',
      website: 'https://www.deel.com',
      description: 'Plataforma global de EOR (Employer of Record) y gestión de nómina para equipos remotos.',
      country: 'USA / Global',
      vertical_finnovista: 'HR Tech / Fintech',
      product_category: 'EOR / Global Payroll',
      strategic_notes: 'Nodo masivo de poder. Mueven miles de millones en salarios transfronterizos.'
    }
  ];

  console.log("🚀 Insertando 7 jugadores clave del Activant Thesis Map...");

  for (const company of companies) {
    const { data: res, error } = await supabase.from('empresas_v2').insert(company).select('id').single();
    if (error) {
      console.error(`❌ Error con ${company.name}:`, error.message);
    } else {
      console.log(`✅ ${company.name} insertada con ID: ${res.id}`);
    }
  }
}

addActivantThesis();
