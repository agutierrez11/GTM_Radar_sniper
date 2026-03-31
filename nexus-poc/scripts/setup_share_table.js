const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createTable() {
  console.log("Checking/Creating public_reports table...");
  const { error } = await supabase.rpc('create_public_reports_table_if_not_exists', {}); 
  
  // If RPC is not available, we try a direct query if allowed or just log instruction
  if (error) {
    console.warn("RPC failed. Please ensure the 'public_reports' table exists with columns: id (uuid), data (jsonb), created_at (timestamp).");
    console.error(error);
  } else {
    console.log("Table check/creation triggered.");
  }
  process.exit();
}

createTable();
