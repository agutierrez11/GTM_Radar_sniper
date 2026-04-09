const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim().replace(/^export /i, '');
                    const value = parts.slice(1).join('=').trim().replace(/^"|^'|"$|'$/g, '');
                    if (!process.env[key]) process.env[key] = value;
                }
            });
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

const args = process.argv.slice(2);
const companyName = args[0];
const competitors = args[1]?.split(',').map(c => c.trim()) || [];
const description = args[2] || null;

async function update() {
  if (!companyName || competitors.length === 0) {
    console.error("Usage: node update_one.js <companyName> <competitors_comma_separated> [description]");
    return;
  }

  console.log(`--- Processing: ${companyName} ---`);
  const { data: company } = await supabase.from('empresas_v2').select('id').ilike('name', `%${companyName}%`).limit(1).maybeSingle();
  
  if (company) {
    const updateData = { competitors_verified: competitors };
    if (description) {
      updateData.description = description;
      updateData.has_full_data = true; // Mark as full data if we have a description now
    }
    
    const { error: updateError } = await supabase.from('empresas_v2').update(updateData).eq('id', company.id);
    if (updateError) {
      console.error(`❌ Error updating ${companyName}:`, updateError.message);
    } else {
      console.log(`✅ Updated verified competitors ${description ? 'and description ' : ''}for ${companyName}`);
      
      for (const comp of competitors) {
        const { data: exists } = await supabase.from('empresas_v2').select('id').ilike('name', comp).maybeSingle();
        if (!exists) {
          await supabase.from('empresas_v2').insert({
            name: comp,
            has_full_data: false,
            source: 'manual_research_discovery'
          });
          console.log(`➕ Nueva empresa descubierta: ${comp}`);
        } else {
          console.log(`🔍 Competidor ya existe: ${comp}`);
        }
      }
    }
  } else {
    console.log(`❌ Company not found: ${companyName}`);
  }
}

update();
