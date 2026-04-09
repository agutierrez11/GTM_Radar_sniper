import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  console.log("🔍 Checking tables...");
  try {
    const { data: v3, error: e3 } = await supabase.from("empresas_v3").select("id").limit(1);
    if (e3) {
      console.log("❌ empresas_v3 NOT found or error:", e3.message);
    } else {
      console.log("✅ empresas_v3 EXISTS and has data.");
    }

    const { data: v2, error: e2 } = await supabase.from("empresas_v2").select("id").limit(1);
    if (e2) {
      console.log("❌ empresas_v2 NOT found or error:", e2.message);
    } else {
      console.log("✅ empresas_v2 EXISTS.");
    }
  } catch (err) {
    console.error("Critical error during check:", err);
  }
}

check();
