"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Mail } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

const btn = "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-line bg-surface text-[15px] font-medium hover:border-line-strong hover:bg-surface-2 disabled:opacity-60";

export function SignInPanel({ failed }: { failed: boolean }) {
  const supabase = getBrowserSupabase();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(failed ? "That sign-in didn't complete. Please try again." : null);

  const callback = () => `${window.location.origin}/auth/callback`;

  const oauth = async (provider: "github" | "google") => {
    if (!supabase) {
      router.push("/onboarding");
      return;
    }
    setBusy(provider);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: callback() } });
    if (error) {
      setBusy(null);
      setError(provider === "google" ? "Google sign-in isn't enabled on this demo yet. Use GitHub or email." : error.message);
    }
  };

  const email = async (form: FormData) => {
    const address = String(form.get("email") ?? "").trim();
    if (!supabase) {
      router.push("/onboarding");
      return;
    }
    setBusy("email");
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email: address, options: { emailRedirectTo: callback() } });
    setBusy(null);
    if (error) setError(error.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="grid gap-3 rounded-lg border border-line bg-surface p-5 text-sm">
        <span className="grid size-9 place-items-center rounded-full bg-good-soft text-good"><Check className="size-4" /></span>
        <span className="font-medium">Check your inbox</span>
        <span className="text-muted">We sent a sign-in link. Open it on this device to continue.</span>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <button className={btn} onClick={() => oauth("github")} disabled={busy !== null}>
          {busy === "github" ? <Loader2 className="size-4 animate-spin" /> : <GitHubIcon />} Continue with GitHub
        </button>
        <button className={btn} onClick={() => oauth("google")} disabled={busy !== null}>
          {busy === "google" ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />} Continue with Google
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-line" /> or use email <span className="h-px flex-1 bg-line" />
      </div>
      <form action={email} className="grid gap-2">
        <label htmlFor="login-email" className="text-sm font-medium">Work email</label>
        <input
          id="login-email"
          type="email"
          name="email"
          required
          maxLength={200}
          placeholder="you@company.com"
          className="h-11 rounded-md border border-line bg-surface px-3 text-sm outline-none placeholder:text-faint focus:border-accent"
        />
        <button disabled={busy !== null} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent text-sm font-medium text-accent-ink hover:opacity-90 disabled:opacity-60">
          {busy === "email" ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} Email me a sign-in link
        </button>
      </form>
      {error && <p role="alert" className="rounded-md bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}
      <Link href="/home" className="text-center text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
        Just looking? Explore the demo workspace without an account
      </Link>
    </div>
  );
}
