import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_VERTICALS = [
  'Tech Infrastructure',
  'Enterprise Financial Management',
  'Crowdfunding',
  'Lending',
  'Insurtech',
  'Personal Financial Management',
  'Open Finance',
  'Payments & Remittances',
  'Proptech',
  'Digital Banking',
  'Wealth Management',
  'Crypto & Blockchain'
];

export interface EnrichmentResult {
  success: boolean;
  field_updated: string[];
  confidence: number;
  data: {
    description?: string;
    vertical?: string;
    website?: string;
  };
  log: string;
}

/**
 * Motor de enriquecimiento individual con reglas RaiSE
 */
export async function enrichCompany(company: any): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    success: false,
    field_updated: [],
    confidence: 0,
    data: {},
    log: `Procesando: ${company.name}`
  };

  try {
    let rawContent = "";
    let source = "";

    // 1. FIRECRAWL (Arsenal Rotation)
    const fc_keys = [
      process.env.FIRECRAWL_API_KEY, process.env.FIRECRAWL_API_KEY_2,
      process.env.FIRECRAWL_API_KEY_3, process.env.FIRECRAWL_API_KEY_4
    ].filter(Boolean);
    
    if (company.website && fc_keys.length > 0) {
      const selectedKey = fc_keys[Math.floor(Math.random() * fc_keys.length)];
      source = `Firecrawl (Key ${fc_keys.indexOf(selectedKey) + 1})`;
      
      const scrapeResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${selectedKey}`
        },
        body: JSON.stringify({ url: company.website, formats: ["markdown"] })
      });
      const scrapeData = await scrapeResp.json();
      if (scrapeData.success) {
        rawContent = scrapeData.data.markdown;
      }
    }

    // 2. TAVILY (Arsenal Rotation)
    const tv_keys = [
      process.env.TAVILY_API_KEY, process.env.TAVILY_API_KEY_2,
      process.env.TAVILY_API_KEY_3, process.env.TAVILY_API_KEY_4,
      process.env.TAVILY_API_KEY_5
    ].filter(Boolean);

    if (!rawContent && tv_keys.length > 0) {
      const selectedKey = tv_keys[Math.floor(Math.random() * tv_keys.length)];
      source = `Tavily (Key ${tv_keys.indexOf(selectedKey) + 1})`;

      const searchResp = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: selectedKey,
          query: `${company.name} fintech ${company.country || ""} description purpose`,
          include_answer: true,
          search_depth: "advanced"
        })
      });
      const searchData = await searchResp.json();
      rawContent = searchData.answer || searchData.results?.[0]?.content || "";
    }
    // 3. SCRAPE.DO (Deep Fallback if Firecrawl & Tavily fail)
    const sd_keys = [
      process.env.SCRAPEDO_API_KEY_VM, process.env.SCRAPE_DO_TOKEN
    ].filter(Boolean);

    if (!rawContent && company.website && sd_keys.length > 0) {
      const selectedKey = sd_keys[Math.floor(Math.random() * sd_keys.length)];
      source = `Scrape.do (Key ${sd_keys.indexOf(selectedKey) + 1})`;

      try {
        const sdUrl = `https://api.scrape.do?token=${selectedKey}&url=${encodeURIComponent(company.website)}`;
        const sdResp = await fetch(sdUrl);
        if (sdResp.ok) {
          rawContent = await sdResp.text();
        }
      } catch (e) {
        // Silently skip if Scrape.do fails
      }
    }

    if (!rawContent) {
      result.log += " | ❌ No se encontró información en ninguna fuente.";
      return result;
    }

    // 4. PROCESAMIENTO CON LLM (Native Gemini v2.0 Library)
    const { generateWithFallback } = require("./gemini");
    const prompt = `Analiza el siguiente contenido sobre la empresa ${company.name}:
    "${rawContent.substring(0, 30000)}"

    Genera un JSON con:
    - description: resumen de máximo 300 palabras centrado en su propuesta de valor.
    - vertical: clasifica en una de estas: [${VALID_VERTICALS.join(", ")}].
    - confidence: score de 0 a 100 basado en qué tan clara es la fuente.
    
    RESPONDE SOLO CON EL JSON.`;

    let parsed;
    try {
      const gResp = await generateWithFallback(prompt);
      parsed = gResp.data;
    } catch (e: any) {
      result.log += ` | ❌ Error Gemini: ${e.message}`;
      console.error("Gemini Error:", e);
      return result;
    }

    result.confidence = parsed.confidence || 0;
    result.data.description = parsed.description;
    result.data.vertical = parsed.vertical;

    // 4. APLICACIÓN DE REGLAS DE GUARDADO
    const updates: any = {};
    if (!company.description && result.data.description && result.confidence >= 80) {
      updates.description = result.data.description;
      result.field_updated.push("description");
    }
    if (!company.vertical_finnovista && VALID_VERTICALS.includes(result.data.vertical as string)) {
      updates.vertical_finnovista = result.data.vertical;
      result.field_updated.push("vertical");
    }
    if (!company.website && result.data.website) {
      updates.website = result.data.website;
      result.field_updated.push("website");
    }

    // has_full_data check
   const final_name = company.name;
    const final_country = company.country;
    const final_vertical = updates.vertical_finnovista || company.vertical_finnovista;
    const final_desc = updates.description || company.description;

    if (final_name && final_country && final_vertical && final_desc) {
      updates.has_full_data = true;
      result.field_updated.push("has_full_data");
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('empresas_v2')
        .update(updates)
        .eq('id', company.id);
      
      if (!error) {
        result.success = true;
        result.log += ` | ✅ Actualizado: ${result.field_updated.join(", ")} (${source})`;
      } else {
        result.log += ` | ❌ Error Supabase: ${error.message}`;
      }
    } else {
      result.log += ` | ⏩ Nivel de Confianza insuficiente (${result.confidence}%) o sin cambios.`;
    }

  } catch (err: any) {
    result.log += ` | ❌ Error crítico: ${err.message}`;
  }

  return result;
}
