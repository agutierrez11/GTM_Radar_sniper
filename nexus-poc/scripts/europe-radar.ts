
/**
 * NERV Advanced Radar: European Expansion Signals
 * Motor: Tavily (Search) + Groq (High-Speed Inference)
 */

import { generateWithGroq } from '../src/lib/groq';

const EUROPE_TOP_100 = [
  { name: "Revolut", country: "UK", vertical: "Neobank" },
  { name: "Monzo", country: "UK", vertical: "Neobank" },
  { name: "Klarna", country: "Sweden", vertical: "BNPL" },
  { name: "N26", country: "Germany", vertical: "Neobank" },
  { name: "Mollie", country: "Netherlands", vertical: "Payments" },
  { name: "SumUp", country: "UK/Germany", vertical: "POS/Payments" },
  { name: "Checkout.com", country: "UK", vertical: "Acquiring" },
  { name: "Adyen", country: "Netherlands", vertical: "Payments" },
  { name: "Salt Edge", country: "Canada/UK", vertical: "Open Banking" },
  { name: "Railsr", country: "UK", vertical: "BaaS" },
  { name: "Solaris", country: "Germany", vertical: "BaaS" },
  { name: "TrueLayer", country: "UK", vertical: "Open Banking" },
  { name: "PPRO", country: "Germany", vertical: "Local Payments" },
  { name: "Paddle", country: "UK", vertical: "SaaS Payments" },
  { name: "Wise", country: "UK", vertical: "Remittances" },
  // ... más empresas se añadirán dinámicamente
];

const SIGNALS = [
  "Phantom Hiring: Buscando personal en Latam sin tener oficina local.",
  "Regulatory Footprint: Solicitudes de licencias (CNBV, CMF, BCRA).",
  "Localization: Nuevos dominios .mx, .br, .co o traducción a Español/Portugués.",
  "Partnerships: Alianzas con bancos o fintechs en Latam (ej. Pomelo, Belvo).",
  "PR/Expansion: Comunicados oficiales sobre planes en el 'nuevo continente'."
];

async function scanEuropeExpansion() {
  console.log("🇪🇺 Iniciando Radar de Avanzada — Hub Europa");
  const tavilyKey = process.env.TAVILY_API_KEY;

  for (const company of EUROPE_TOP_100.slice(0, 5)) { // Demo con las primeras 5
    console.log(`\n🕵️ Escaneando [${company.name}] (${company.country})...`);
    
    // Query optimizada para señales de expansión
    const query = `${company.name} fintech expansion Latam Mexico Brazil news 2026 hiring licenses`;
    
    try {
      const searchResp = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          search_depth: "advanced",
          max_results: 5
        })
      });

      const results = await searchResp.json();
      const context = results.results?.map((r: any) => `- ${r.title}: ${r.content} (${r.url})`).join("\n") || "No se hallaron noticias frescas.";

      const prompt = `
      Analiza estas noticias sobre la fintech europea ${company.name} y detecta señales de expansión a LATAM.
      Noticias encontradas:
      ${context}

      Utiliza estos criterios de señales:
      ${SIGNALS.join("\n")}

      Responde en JSON:
      {
        "detected": true/false,
        "signals": ["señal1", "señal2"],
        "summary": "Resumen conciso del hallazgo",
        "impact": <0-10>,
        "sources": ["url1", "url2"]
      }
      `;

      const analysis = await generateWithGroq(prompt);

      if (analysis.detected) {
        console.log(`🚀 ¡SEÑAL DETECTADA! Impacto: ${analysis.impact}/10`);
        console.log(`🏢 ${company.name} -> ${analysis.summary}`);
        console.log(`🔗 Fuentes: ${analysis.sources.join(", ")}`);
      } else {
        console.log(`✅ ${company.name}: Sin señales críticas de expansión detectadas hoy.`);
      }

    } catch (err) {
      console.error(`❌ Error en ${company.name}:`, err);
    }
  }
}

scanEuropeExpansion();
