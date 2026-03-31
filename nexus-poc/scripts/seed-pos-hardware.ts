import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const companies = [
  { name: 'PAX Global Technology', country: 'China', market_share_pct: 9.83 },
  { name: 'Ingenico', country: 'Francia', market_share_pct: 9.81 },
  { name: 'Verifone', country: 'USA', market_share_pct: 7.80 },
  { name: 'Newland NPT', country: 'China', market_share_pct: 5.37 },
  { name: 'Aisino Corporation', country: 'China', market_share_pct: 5.26 },
  { name: 'SUNMI Technology', country: 'China', market_share_pct: 4.02 },
  { name: 'HP', country: 'USA', market_share_pct: 3.81 },
  { name: 'Toshiba Tec', country: 'Japón', market_share_pct: 3.32 },
  { name: 'NEXGO', country: 'China', market_share_pct: 3.29 },
  { name: 'Diebold Nixdorf', country: 'USA/Alemania', market_share_pct: 3.28 },
  { name: 'Fiserv', country: 'USA', market_share_pct: 2.96 },
  { name: 'Elo Touch Solutions', country: 'USA', market_share_pct: 2.91 },
  { name: 'iMin Technology', country: 'China/Singapur', market_share_pct: 2.69 },
  { name: 'Castles Technology', country: 'Taiwán', market_share_pct: 2.08 },
  { name: 'Centerm', country: 'China', market_share_pct: 2.02 },
  { name: 'Nexi', 'country': 'Italia', market_share_pct: 1.57 },
  { name: 'Block (Square)', country: 'USA', market_share_pct: 1.46 },
  { name: 'Toast', country: 'USA', market_share_pct: 1.39 },
  { name: 'Tianyu', country: 'China', market_share_pct: 1.32 }
];

async function seed() {
  console.log("🌱 Iniciando siembra de Hardware POS...");
  
  for (const company of companies) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('empresas_v2')
      .select('id')
      .eq('name', company.name)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`⏭️  ${company.name} ya existe, saltando.`);
      continue;
    }

    const { error } = await supabase
      .from('empresas_v2')
      .insert({
        ...company,
        vertical_finnovista: 'Tech Infrastructure',
        segment_latamfintech: 'Hardware POS',
        strategic_notes: 'Leading indicator — Movimientos globales anticipan cambios en Latam',
        has_full_data: false
      });

    if (error) {
      console.error(`❌ Error con ${company.name}:`, error.message);
    } else {
      console.log(`✅ ${company.name} insertada.`);
    }
  }
}

seed();
