"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Compass, X } from "lucide-react";
import { usePrefs } from "@/components/providers";

type Step = { href: string; title: string; body: string; lens?: "simple" | "pro" };

const steps: Step[] = [
  { href: "/home", title: "Start anywhere", body: "Describe an idea, or drop a real spreadsheet into “Start from your data” and Architect proposes agents from what's in it. Top right: Simple or Pro view of the same project.", lens: "simple" },
  { href: "/p/claims-triage/plan", title: "Sign a plan, not a prompt", body: "Nothing is built until you sign. The plan says what each agent may do on its own, what could go wrong and what stops it, and what it will cost." },
  { href: "/p/claims-triage?build=1", title: "Watch it being built", body: "Every step is visible and saved as a checkpoint. Every change shows its cost before it runs. Click a row in the preview to see what each agent did." },
  { href: "/p/claims-triage/agents", title: "Proof the agents work", body: "Each agent has a report card from 1,200 simulated cases: where it fails, and a one-click fix. This is Lyzr's simulation engine, brought into the builder." },
  { href: "/p/claims-triage/deploy", title: "Safe to go live", body: "Go live runs tests, a security scan, a secrets check, eval thresholds and a spending cap. Any failure stops the deploy and explains why." },
  { href: "/p/claims-triage/git", title: "Same project, Pro view", body: "Switched you to Pro: branch per task, real pull requests with checks. Try Build and Agents again to see code, diffs and traces.", lens: "pro" },
  { href: "/developers", title: "Keep your editor", body: "A CLI and an MCP server let Claude Code, Cursor or Codex drive Architect. Press Ctrl+K anywhere to jump around." },
];

const KEY = "architect.tour";
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const read = () => {
  try {
    return Number(localStorage.getItem(KEY) ?? "-1");
  } catch {
    return -1;
  }
};
function setStep(n: number) {
  try {
    localStorage.setItem(KEY, String(n));
  } catch {
    // Tour just won't survive a reload.
  }
  listeners.forEach((fn) => fn());
}

export function startTour() {
  setStep(0);
}

/** A short guided walk through the differentiators, for first-time visitors and reviewers. */
export function Tour() {
  const router = useRouter();
  const pathname = usePathname();
  const { setLens } = usePrefs();
  const step = useSyncExternalStore(subscribe, read, () => -1);

  useEffect(() => {
    const onStart = () => {
      setStep(0);
      router.push(steps[0].href);
    };
    window.addEventListener("architect:tour", onStart);
    return () => window.removeEventListener("architect:tour", onStart);
  }, [router]);

  if (step < 0 || step >= steps.length || pathname === "/" || pathname === "/login") return null;
  const s = steps[step];

  const goTo = (n: number) => {
    if (n >= steps.length) return setStep(-1);
    setStep(n);
    if (steps[n].lens) setLens(steps[n].lens!);
    router.push(steps[n].href);
  };

  return (
    <aside aria-label="Guided tour" className="fixed right-4 bottom-4 z-40 grid w-[min(360px,calc(100vw-2rem))] gap-3 rounded-xl border border-accent/40 bg-surface p-4 shadow-2xl">
      <div className="flex items-center gap-2">
        <Compass className="size-4 text-accent" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-accent">Tour · {step + 1} of {steps.length}</span>
        <button onClick={() => setStep(-1)} aria-label="End tour" className="ml-auto grid size-7 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink">
          <X className="size-4" />
        </button>
      </div>
      <div className="grid gap-1">
        <span className="font-semibold">{s.title}</span>
        <p className="text-sm text-muted">{s.body}</p>
      </div>
      <div className="flex items-center gap-1">
        {steps.map((_, i) => <span key={i} className={i <= step ? "h-1 w-5 rounded-full bg-accent" : "h-1 w-5 rounded-full bg-line"} />)}
      </div>
      <div className="flex justify-between gap-2">
        <button onClick={() => goTo(step - 1)} disabled={step === 0} className="flex h-8 items-center gap-1 rounded-md px-2 text-sm text-muted hover:bg-surface-2 disabled:opacity-40">
          <ArrowLeft className="size-4" /> Back
        </button>
        {pathname.split("?")[0] !== s.href.split("?")[0] ? (
          <button onClick={() => router.push(s.href)} className="flex h-8 items-center gap-1 rounded-md border border-line px-3 text-sm hover:border-accent">Show me</button>
        ) : (
          <button onClick={() => goTo(step + 1)} className="flex h-8 items-center gap-1 rounded-md bg-accent px-3 text-sm font-medium text-accent-ink hover:opacity-90">
            {step === steps.length - 1 ? "Finish" : "Next"} <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
