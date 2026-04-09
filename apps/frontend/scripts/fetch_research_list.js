const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            for (const line of lines) {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim().replace(/^export /i, '');
                    const value = parts.slice(1).join('=').trim().replace(/^"|^'|"$|'$/g, '');
                    if (!process.env[key]) process.env[key] = value;
                }
            }
        }
    } catch (err) {
        console.error("Warning: Could not load .env.local", err.message);
    }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing required environment variables!");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchNext() {
  const { data, error } = await supabase
    .from('empresas_v2')
    .select('name')
    .not('description', 'is', null)
    .is('competitors_verified', null)
    .order('name', { ascending: true })
    .limit(20);

  if (error) {
    console.error(error);
  } else {
    console.log(data.map(d => d.name).join(','));
  }
}

fetchNext();
