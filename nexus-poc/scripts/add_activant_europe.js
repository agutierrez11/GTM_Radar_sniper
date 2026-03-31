const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function addActivantEurope() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const companies = [
    {
      name: 'Aibidia',
      website: 'https://aibidia.com',
      description: 'Plataforma líder en gestión de precios de transferencia global. Digitalización de Tax compliance.',
      country: 'Finlandia',
      vertical_finnovista: 'Taxtech / B2B',
      product_category: 'Global Transfer Pricing',
      strategic_notes: 'Empresa del portafolio de Activant Capital. Foco en cumplimiento fiscal global para multinacionales.'
    },
    {
      name: 'Airwallex',
      website: 'https://www.airwallex.com',
      description: 'Infraestructura global de banca y pagos. Cuentas locales en más de 30 países y rieles de pago masivos.',
      country: 'Australia / Europa',
      vertical_finnovista: 'Paytech',
      product_category: 'BaaS / Multi-currency Accounts',
      strategic_notes: 'Jugador masivo en infraestructura de pagos transfronterizos. Clave para la tesis de la multi-riel de Activant.'
    },
    {
      name: 'Celonis',
      website: 'https://www.celonis.com',
      description: 'Líder mundial en Process Mining. Optimización inteligente de procesos de negocio.',
      country: 'Alemania',
      vertical_finnovista: 'B2B Software',
      product_category: 'Process Mining / Execution Management',
      strategic_notes: 'Unicornio alemán de alto nivel. Integrado en NERV por su impacto en la eficiencia operativa de pagos.'
    },
    {
      name: 'Finny',
      website: 'https://www.finny.com',
      description: 'Plataforma de WealthTech de nueva generación impulsada por IA. Educación y gestión patrimonial.',
      country: 'Alemania',
      vertical_finnovista: 'Wealthtech',
      product_category: 'AI Wealth Management',
      strategic_notes: 'Enfoque en democratización de inversiones vía IA.'
    },
    {
      name: 'Gr4vy',
      website: 'https://gr4vy.com',
      description: 'Orquestación de pagos nativa en la nube. Permite conectar múltiples proveedores de pago con una sola API.',
      country: 'UK',
      vertical_finnovista: 'Paytech',
      product_category: 'Payment Orchestration',
      strategic_notes: 'Crítico para la redundancia de rieles de pago en empresas globales.'
    },
    {
      name: 'Vivenu',
      website: 'https://vivenu.com',
      description: 'Plataforma global de ticketing directo. Gestión de pagos y audiencias a escala.',
      country: 'Alemania',
      vertical_finnovista: 'Ticketing / Paytech',
      product_category: 'Direct Ticketing',
      strategic_notes: 'Maneja volúmenes transaccionales masivos para eventos globales.'
    },
    {
      name: 'WorkMotion',
      website: 'https://workmotion.com',
      description: 'Plataforma de gestión de recursos humanos y nómina global (EOR) para equipos remotos.',
      country: 'Alemania',
      vertical_finnovista: 'HR Tech / Fintech',
      product_category: 'Global Payroll',
      strategic_notes: 'Gestiona la complejidad de pagos transfronterizos para salarios.'
    }
  ];

  console.log("🚀 Insertando 7 fintechs europeas de Activant...");

  for (const company of companies) {
    const { data: res, error } = await supabase.from('empresas_v2').insert(company).select('id').single();
    if (error) {
      console.error(`❌ Error con ${company.name}:`, error.message);
    } else {
      console.log(`✅ ${company.name} insertada con ID: ${res.id}`);
    }
  }
}

addActivantEurope();
