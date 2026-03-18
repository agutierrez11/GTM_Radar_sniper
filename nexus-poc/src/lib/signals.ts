/**
 * Signals Utility
 * Proporciona enriquecimiento de datos en tiempo real para evitar estados "PENDIENTE".
 */

export interface LiveSignal {
  description?: string;
  website?: string;
  latido?: string;
  sources: string[];
}

export async function fetchLiveSignals(company: string, vertical: string): Promise<LiveSignal | null> {
  const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
  
  if (!TAVILY_API_KEY) {
    console.log("Signals: TAVILY_API_KEY no encontrada. Saltando enriquecimiento en tiempo real.");
    return null;
  }

  try {
    const query = `${company} ${vertical} latam news 2026 partnership strategy`;
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: "advanced",
        include_answer: true,
        max_results: 5
      })
    });

    const data = await response.json();
    
    return {
      description: data.answer || "Descripción recuperada vía Live Search.",
      latido: data.results?.[0]?.content?.substring(0, 300) + "...",
      sources: data.results?.map((r: any) => r.url) || []
    };
  } catch (error) {
    console.error("Error fetching live signals:", error);
    return null;
  }
}
