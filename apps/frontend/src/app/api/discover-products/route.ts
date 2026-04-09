import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const fcKey = process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY_2;
    
    // 1. Scrape URL
    const scrapeResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${fcKey}`
      },
      body: JSON.stringify({ url, formats: ["markdown"] })
    });
    
    const scrapeData = await scrapeResp.json();
    let markdown = (scrapeData.success && scrapeData.data) ? scrapeData.data.markdown : null;

    if (!markdown) {
      console.warn("DISCOVER_PRODUCTS: Firecrawl failed, trying Tavily fallback...");
      const { searchTavily } = await import("@/lib/tavily");
      const searchRes = await searchTavily(`what products and services does ${url} offer?`);
      markdown = searchRes?.answer || JSON.stringify(searchRes?.results?.map((r: any) => r.content));
    }

    if (!markdown) {
       throw new Error("No se pudo obtener información de la empresa ni por scraping ni por búsqueda.");
    }

    // 2. Extract Products using LLM
    const prompt = `Analiza el siguiente contenido de la página web de una empresa:
    
    "${markdown.substring(0, 20000)}"
    
    Extrae una lista de productos, servicios o soluciones que ofrece la empresa. 
    Para cada uno, proporciona un nombre corto y una descripción de una oración.
    
    Responde ÚNICAMENTE con un JSON válido con esta estructura:
    {
      "empresa": "Nombre de la empresa",
      "descripcion_corta": "Resumen de 1 párrafo",
      "productos": [
        { "nombre": "Producto 1", "descripcion": "Descripción breve" },
        ...
      ]
    }`;

    try {
      const gResp = await generateWithFallback(prompt);
      if (!gResp || !gResp.data) throw new Error("Gemini invalid response");
      return NextResponse.json(gResp.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("DISCOVER_PRODUCTS_LLM:", err);
      return NextResponse.json({ error: msg || "Fallo del modelo (Gemini)" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("DISCOVER_PRODUCTS_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
