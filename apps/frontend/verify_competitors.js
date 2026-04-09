const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load .env.local if not already in env
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length === 2) {
                    const key = parts[0].trim().replace(/^export /i, '');
                    const value = parts[1].trim().replace(/^"|^'|"$|'$/g, '');
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
const TAVILY_KEY = process.env.TAVILY_API_KEY_2;
const GROQ_KEY = process.env.GROQ_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !TAVILY_KEY || !GROQ_KEY) {
    console.error("❌ Missing required environment variables (SUPABASE, TAVILY_2 or GROQ)!");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateWithGroq(prompt) {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        })
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

async function verifyCompetitors() {
    console.log("🚀 Starting Competitor Verification Universe with Groq & Discovery...");
    
    const { data: companies, error } = await supabase
        .from('empresas_v2')
        .select('id, name, description, country')
        .not('description', 'is', null)
        .is('competitors_verified', null);

    if (error) {
        console.error("❌ Error fetching companies:", error.message);
        return;
    }

    console.log(`📦 Found ${companies.length} companies to process.`);
    let processed = 0;
    let successCount = 0;
    let discoveryCount = 0;

    for (const company of companies) {
        try {
            // 1. Search Tavily
            const searchResp = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: TAVILY_KEY,
                    query: `main direct competitors of ${company.name} fintech in ${company.country || 'Latam'}`,
                    include_answer: true,
                    search_depth: "advanced"
                })
            });
            const searchData = await searchResp.json();
            const rawContent = searchData.answer || searchData.results?.map(r => r.content).join("\n") || "";

            if (!rawContent) {
                console.log(`⏩ [${processed + 1}] ${company.name}: No info found.`);
                processed++;
                continue;
            }

            // 2. LLM Parse with Groq
            const prompt = `Based on the following information about ${company.name}, list its top 5-8 direct competitors as a JSON object with a "competitors" key containing an array of strings.
            Company Description: ${company.description}
            Search Results: "${rawContent.substring(0, 10000)}"
            
            Example response: {"competitors": ["Comp A", "Comp B"]}`;

            const responseText = await generateWithGroq(prompt);
            let competitors = [];
            try {
                const parsed = JSON.parse(responseText);
                competitors = parsed.competitors || [];
            } catch (e) {
                console.warn(`⚠️ Parse error for ${company.name}: ${e.message}`);
            }

            if (Array.isArray(competitors) && competitors.length > 0) {
                // 3. Update Supabase (Main Company)
                const { error: updateError } = await supabase
                    .from('empresas_v2')
                    .update({ competitors_verified: competitors })
                    .eq('id', company.id);
                
                if (updateError) {
                    console.error(`❌ Update failed for ${company.name}:`, updateError.message);
                } else {
                    console.log(`✅ [${processed + 1}] ${company.name}: ${competitors.join(", ")}`);
                    successCount++;

                    // 4. Discover New Competitors
                    for (const competitorName of competitors) {
                        const { data: exists } = await supabase
                            .from('empresas_v2')
                            .select('id')
                            .ilike('name', competitorName)
                            .maybeSingle();
                        
                        if (!exists) {
                            const { error: insertError } = await supabase.from('empresas_v2').insert({
                                name: competitorName,
                                has_full_data: false,
                                source: 'tavily_competitor_discovery'
                            });
                            
                            if (insertError) {
                                console.error(`❌ Discovery insert failed for ${competitorName}:`, insertError.message);
                            } else {
                                console.log(`➕ Nueva empresa descubierta: ${competitorName}`);
                                discoveryCount++;
                            }
                        }
                    }
                }
            } else {
                console.log(`⏩ [${processed + 1}] ${company.name}: No competitors found by LLM.`);
            }

        } catch (err) {
            console.error(`❌ Error with ${company.name}:`, err.message);
        }

        processed++;
        if (processed % 50 === 0) {
            console.log(`\n📊 PROGRESS REPORT: ${processed}/${companies.length} processed. Success: ${successCount}. New: ${discoveryCount}\n`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n🏁 FINISHED UNIVERSE ENRICHMENT`);
    console.log(`📊 Total processed: ${processed}`);
    console.log(`📊 Total successful: ${successCount}`);
    console.log(`📊 Total new discovered: ${discoveryCount}`);
}

verifyCompetitors();
