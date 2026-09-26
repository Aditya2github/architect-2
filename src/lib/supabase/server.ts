import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseEnabled, supabaseKey, supabaseUrl } from "./config";

/** Server-side client bound to the request cookies, or null in demo mode. */
export async function getServerSupabase() {
  if (!supabaseEnabled) return null;
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. The proxy refreshes them.
        }
      },
    },
  });
}

export async function getCurrentUser() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}
