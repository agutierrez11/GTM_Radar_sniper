import axios from 'axios';

// Simplificación de los clients para Express (sin usar los del Next.js para evitar conflictos)
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY_2;

export async function scrapeUrl(url: string) {
  try {
    const resp = await axios.post("https://api.firecrawl.dev/v1/scrape", 
      { url, formats: ["markdown"] },
      { headers: { "Authorization": `Bearer ${FIRECRAWL_KEY}` } }
    );
    return resp.data.success ? resp.data.data.markdown : "";
  } catch (err) {
    console.error("SCRAPE_ERR:", err);
    return "";
  }
}

export async function askGemini(prompt: string) {
  try {
    const resp = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }
    );
    const content = resp.data.candidates[0].content.parts[0].text;
    return JSON.parse(content);
  } catch (err) {
     console.error("GEMINI_ERR:", err);
     throw err;
  }
}
