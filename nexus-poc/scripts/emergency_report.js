const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getReport() {
  console.log("--- REPORTE DE CONSULTAS (ÚLTIMAS 24H) ---");
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error, count } = await supabase
    .from('logs_busquedas')
    .select('id, ip_address, created_at', { count: 'exact' })
    .gte('created_at', yesterday);

  if (error) {
    console.error("Error fetching logs:", error);
    return;
  }

  const total = count || 0;
  const ips = new Set(data.map(log => log.ip_address).filter(ip => ip));
  const distinctIps = ips.size;

  console.log(`Total consultas: ${total}`);
  console.log(`IPs distintas: ${distinctIps}`);
  console.log(`Detalle de IPs con más actividad:`);
  
  const ipCounts = {};
  data.forEach(log => {
    if (log.ip_address) {
      ipCounts[log.ip_address] = (ipCounts[log.ip_address] || 0) + 1;
    }
  });

  console.table(Object.entries(ipCounts).sort((a,b) => b[1] - a[1]).slice(0, 10));
  
  // Also check schema
  const { data: schemaData } = await supabase.from('logs_busquedas').select('*').limit(1);
  console.log("Schema columns detected:", Object.keys(schemaData[0] || {}));
  
  process.exit();
}

getReport();
