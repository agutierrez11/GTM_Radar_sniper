import { createClient } from '@supabase/supabase-client-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkVerticals() {
  console.log("--- VERTICALS IN DB ---");
  const { data, error } = await supabase
    .from('empresas_v2')
    .select('vertical_finnovista')
    .limit(500);
  
  if (error) {
    console.error("Error:", error);
    return;
  }

  const counts: Record<string, number> = {};
  data.forEach(d => {
    const v = d.vertical_finnovista || "NULL";
    counts[v] = (counts[v] || 0) + 1;
  });

  console.log(JSON.stringify(counts, null, 2));
}

checkVerticals();
