const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const lote1Updates = [
  {
    id: 43,
    name: "Albo",
    product_category: "Neobanking / Personal Finance Management",
    strategic_notes: "SIS [Evidence-Link: https://www.albo.mx/]. Consolidado como líder en inclusión financiera en México. Modelo de negocio basado en transaccionalidad y servicios de valor agregado. [Inferencia — expansión a crédito personal en fase de escalamiento].",
    competitors_verified: ["Nubank", "Klar", "Stori", "Fondeadora"]
  },
  {
    id: 42,
    name: "Nubank",
    product_category: "Neobanking / Credit Cards / Multi-product Platform",
    strategic_notes: "SIS [Evidence-Link: https://nubank.com.mx/]. El neobanco más grande de LatAm. Estrategia en México enfocada en 'Cuenta Nu' (Captación masiva). [Inferencia — valoración actual post-IPO en rango de $50B-$60B depende de volatilidad diaria].",
    competitors_verified: ["Klar", "Albo", "Stori", "Ualá"]
  },
  {
    id: 44,
    name: "Klar",
    product_category: "Neobanking / Lending-Led Banking",
    strategic_notes: "SIS [Evidence-Link: https://www.klar.mx/]. Diferenciador en otorgamiento de crédito basado en data alternativa. [Inferencia — posible búsqueda de licencia bancaria completa en 2025 para reducir costo de fondeo].",
    competitors_verified: ["Nubank", "Albo", "Stori"]
  },
  {
    id: 55,
    name: "Stori",
    product_category: "Neobanking / Credit Inclusion",
    strategic_notes: "SIS [Evidence-Link: https://www.storicard.com/]. Fuerte foco en la base de la pirámide (segmentos no bancarizados). Unicornio mexicano. [Inferencia — retención de usuarios basada en educación financiera gamificada].",
    competitors_verified: ["Nubank", "Klar", "Vexi"]
  },
  {
    id: 244,
    name: "Ree",
    product_category: "Digital Banking / Specialized Personal Finance",
    strategic_notes: "SIS [Evidence-Link: https://ree.mx/]. Enfoque en nichos de ahorro programado. [Inferencia — tamaño de base de usuarios estimado en <100k, sin reporte auditado público].",
    competitors_verified: ["Albo", "Flink"]
  },
  {
    id: 302,
    name: "Oink",
    product_category: "Digital Banking / Financial Education for Kids",
    strategic_notes: "SIS [Evidence-Link: https://www.oink.mx/]. Startup de educación financiera para menores con control parental. [Inferencia — pivote potencial hacia B2B para bancos tradicionales que buscan captar Gen Z].",
    competitors_verified: ["Mozper", "Finny"]
  },
  {
    id: 344,
    name: "Yink",
    product_category: "Digital Banking / Micro-Investments",
    strategic_notes: "SIS [Evidence-Link: https://yink.mx/]. Plataforma de micro-inversiones transaccionales. [Inferencia — bajo volumen de transacciones vs competidores regionales].",
    competitors_verified: ["Flink", "Hapi"]
  },
  {
    id: 144,
    name: "Wink",
    product_category: "Neobanking / Lifestyle Banking",
    strategic_notes: "SIS [Evidence-Link: https://holawink.com/]. Banco digital líder en Costa Rica/Centroamérica. [Inferencia — posible expansión a Colombia bajo sandbox regulatorio].",
    competitors_verified: ["Lulo Bank", "Nequi"]
  },
  {
    id: 1234,
    name: "Lulo Bank",
    product_category: "Neobanking / Full Banking License (CO)",
    strategic_notes: "SIS [Evidence-Link: https://www.lulobank.com/]. El primer banco 100% digital de Colombia con licencia completa. Parte de Gilinski Group. [Inferencia — sin planes inmediatos de internacionalización fuera de CO].",
    competitors_verified: ["Nu Colombia", "Nequi", "DaviPlata"]
  },
  {
    id: 1567,
    name: "Z.ro Bank",
    product_category: "Digital Banking / Crypto-Led Banking",
    strategic_notes: "SIS [Evidence-Link: https://zrobank.com.br/]. Fintech brasileña que integra banca tradicional con multi-moneda y cripto. [Inferencia — alta dependencia del marco regulatorio de criptoactivos en Brasil].",
    competitors_verified: ["Ripio", "Mercado Pago"]
  }
];

async function updateLote() {
  console.log('Iniciando actualización SIS Lote 1...');
  for (const update of lote1Updates) {
    const { error } = await supabase
      .from('empresas_v2')
      .update({
        product_category: update.product_category,
        strategic_notes: update.strategic_notes,
        competitors_verified: update.competitors_verified,
        signal_context: 'SIS SIS SIS' // Tagging as enriched by SIS
      })
      .eq('id', update.id);
    
    if (error) {
      console.error(`Error actualizando ${update.name}:`, error);
    } else {
      console.log(`[OK] ${update.name} (ID: ${update.id}) enriquecido con SIS.`);
    }
  }
  process.exit();
}

updateLote();
