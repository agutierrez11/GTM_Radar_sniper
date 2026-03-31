const { createClient } = require('@supabase/supabase-client-js');
const fs = require('fs');
const path = require('path');

// Read from .env.local manually
try {
  const envPath = path.join(process.cwd(), '.env.local');
  const env = fs.readFileSync(envPath, 'utf8');
  const urlRegex = /NEXT_PUBLIC_SUPABASE_URL=(.*)/;
  const keyRegex = /NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/;
  
  const url = env.match(urlRegex)[1].trim();
  const key = env.match(keyRegex)[1].trim();

  const supabase = createClient(url, key);

  async function checkVerticals() {
    console.log("--- VERTICALS IN DB (SAMPLE 1000) ---");
    const { data, error } = await supabase
      .from('empresas_v2')
      .select('vertical_finnovista')
      .limit(1000);
    
    if (error) {
      console.error("Error:", error);
      return;
    }

    const counts = {};
    data.forEach(d => {
      const v = d.vertical_finnovista || "NULL";
      counts[v] = (counts[v] || 0) + 1;
    });

    console.log(JSON.stringify(counts, null, 2));
  }

  checkVerticals();
} catch (e) {
  console.error("Setup error:", e.message);
}
