import { generateWithGrok } from '../src/lib/grok';
import { generateWithGroq } from '../src/lib/groq';

async function monitorNews() {
  const useGrok = !!process.env.XAI_API_KEY;
  console.log(`🕵️ NERV Signal Radar (${useGrok ? 'Grok-2' : 'Groq'} Mode) — Escaneando Latam Fintech...`);
  
  const query = "Fintech Latam acquisitions funding M&A strategic partnership March 2026 news";
  const apiKey = process.env.TAVILY_API_KEY;

  try {
    // 1. Tavily Search
    console.log(`🔍 Buscando señales con Tavily: "${query}"...`);
    const searchResp = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "advanced",
        max_results: 10
      })
    });
    
    const searchData: any = await searchResp.json();
    const results = searchData.results || [];

    if (results.length === 0) {
      console.log("📭 No se encontraron señales relevantes hoy.");
      return;
    }

    console.log(`\n📦 Analizando ${results.length} noticias potenciales con Groq (Llama-3.1-70B)...\n`);

    // 2. Groq Analysis
    for (const res of results) {
      const prompt = `Analiza esta noticia y determina si es una señal estratégica relevante para el mundo Fintech en Latam (Adquisición, Ronda de Inversión, Expansión, Alianza Crítica).
      
      Título: ${res.title}
      Contenido: ${res.content}
      URL: ${res.url}

      Genera un JSON con este formato:
      {
        "relevant": boolean,
        "type": "Acquisition" | "Funding" | "Expansion" | "Partnership" | "Other",
        "summary": "resumen corto de 1 frase",
        "impact_score": 0-10,
        "target_companies": ["Nombre1", "Nombre2"]
      }
      
      RESPONDE SOLO CON EL JSON.`;

      const analysis = useGrok 
        ? await generateWithGrok(prompt)
        : await generateWithGroq(prompt);
      
      if (analysis.relevant && (analysis.impact_score >= 5 || !analysis.impact_score)) {
        console.log(`🚀 [${analysis.type.toUpperCase()}] Impacto: ${analysis.impact_score}/10`);
        console.log(`📄 ${analysis.summary}`);
        console.log(`🏢 Empresas: ${analysis.target_companies.join(", ")}`);
        console.log(`🔗 Fuente: ${res.url}`);
        console.log("--------------------------------------------------\n");
      }
    }

  } catch (error: any) {
    console.error("❌ Error en el radar:", error.message);
  }
}

monitorNews();
