import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnabled, supabaseKey, supabaseUrl } from "./config";

let client: SupabaseClient | null = null;

/** Browser client, or null in demo mode. */
export function getBrowserSupabase() {
  if (!supabaseEnabled) return null;
  client ??= createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}
