import { createClient } from "@supabase/supabase-js";

/**
 * Cliente anon solo para Route Handlers (Node). No usar en "use client".
 * El singleton de @/lib/supabase usa cookies vía createBrowserClient.
 */
export const supabaseRouteAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
