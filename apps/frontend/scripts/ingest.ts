import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1!);

async function embedAndStore(content: string, metadata: any = {}) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(content);
  const embedding = result.embedding.values;

  const { error } = await supabase.from("knowledge_base").insert({
    content,
    embedding,
    metadata,
  });

  if (error) console.error("Error storing embedding:", error);
  else console.log("Stored successful chunk.");
}

// Ejemplo de uso:
// embedAndStore("Koin es el líder en antifraude para iGaming en Brasil...", { category: "competitor_intel" });
