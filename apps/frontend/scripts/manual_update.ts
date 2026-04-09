import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const top10 = [
  { name: 'Nubank', competitors: ['Ualá', 'Mercado Pago', 'Banco Inter', 'PagBank', 'Neon'] },
  { name: 'EBANX', competitors: ['dLocal', 'PayU', 'Stripe', 'PayPal', 'Rebill'] },
  { name: 'Nuvei', competitors: ['EBANX', 'PayU', 'PagSeguro', 'Stone Co.', 'PayRetailers'] },
  { name: 'Nium', competitors: ['dLocal', 'EBANX', 'Rapyd', 'Airwallex', 'Wise'] },
  { name: 'Backbase', competitors: ['Bankingly', 'COBIS', 'Mambu', 'Galileo Financial Technologies', 'Technisys'] },
  { name: 'Konfío', competitors: ['Xepelin', 'R2', 'Creditas', 'Cumplo', 'Clara'] },
  { name: 'Belvo', competitors: ['Prometeo', 'Fintoc', 'Pluggy', 'Floid', 'Celcoin'] },
  { name: 'Albo', competitors: ['Nubank', 'Ualá', 'Klar', 'Fondeadora', 'Cuenca'] },
  { name: 'Clip', competitors: ['Mercado Pago', 'Konfío', 'Ualá', 'Zettle (PayPal)', 'Kushki'] },
  { name: 'Kushki', competitors: ['Adyen', 'PayU', 'dLocal', 'Stripe', 'Conekta'] }
];

async function updateAll() {
  console.log("🚀 Starting manual update of Top 10 companies...");
  for (const item of top10) {
    console.log(`\n--- Processing: ${item.name} ---`);
    const { data: company, error: fetchError } = await supabase
      .from('empresas_v2')
      .select('id')
      .ilike('name', `%${item.name}%`)
      .limit(1)
      .maybeSingle();
    
    if (fetchError) {
      console.error(`❌ Error fetching ${item.name}:`, fetchError.message);
      continue;
    }

    if (company) {
      const { error: updateError } = await supabase
        .from('empresas_v2')
        .update({ competitors_verified: item.competitors })
        .eq('id', company.id);
        
      if (updateError) {
        console.error(`❌ Error updating ${item.name}:`, updateError.message);
      } else {
        console.log(`✅ Updated verified competitors for ${item.name}`);
        
        for (const comp of item.competitors) {
          const { data: exists } = await supabase
            .from('empresas_v2')
            .select('id')
            .ilike('name', comp)
            .maybeSingle();
            
          if (!exists) {
            const { error: insertError } = await supabase.from('empresas_v2').insert({
              name: comp,
              has_full_data: false,
              source: 'tavily_competitor_discovery'
            });
            if (insertError) {
              console.error(`❌ Discovery insert failed for ${comp}:`, insertError.message);
            } else {
              console.log(`➕ Nueva empresa descubierta: ${comp}`);
            }
          }
        }
      }
    } else {
      console.log(`❌ Company not found in DB: ${item.name}`);
    }
  }
  console.log("\n🏁 Finished manual update.");
}

updateAll();
