import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

// OAuth and magic-link sign-ins land here with a one-time code, or with an error from the provider.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/onboarding";
  // Only allow same-site relative redirects.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";

  const fail = (reason: string) => {
    console.error("[auth/callback] sign-in failed:", reason);
    const to = new URL("/login", url.origin);
    to.searchParams.set("error", reason.slice(0, 200));
    return NextResponse.redirect(to);
  };

  const providerError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (providerError) return fail(providerError);

  const supabase = await getServerSupabase();
  if (!supabase) return fail("Sign-in is not configured on this deployment.");
  if (!code) return fail("The sign-in link was missing its code.");

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail(error.message);
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
