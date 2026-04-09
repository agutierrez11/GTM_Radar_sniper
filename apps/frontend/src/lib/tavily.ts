export async function searchTavily(query: string, searchDepth: "basic" | "advanced" = "basic") {
  const apiKey = process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY_2;
  if (!apiKey) {
    console.error("Tavily API Key missing");
    return null;
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: searchDepth,
        include_answer: true,
        max_results: 5
      })
    });
    
    if (!response.ok) {
        const err = await response.text();
        console.error("Tavily API Error:", err);
        return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Tavily Fetch Error:", error);
    return null;
  }
}
