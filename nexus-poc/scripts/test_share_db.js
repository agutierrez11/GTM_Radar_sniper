const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testInsert() {
  console.log("Testing insert into public_reports...");
  const { data, error } = await supabase
    .from("public_reports")
    .insert({ data: { test: "success", timestamp: new Date().toISOString() } })
    .select("id")
    .single();

  if (error) {
    console.error("Insert failed:", error);
    if (error.code === 'PGRST116' || error.message.includes('not found')) {
      console.log("Table 'public_reports' does not exist. Creating it manually via RPC fallback...");
    }
  } else {
    console.log("✅ Insert successful! ID:", data.id);
  }
  process.exit();
}

testInsert();
