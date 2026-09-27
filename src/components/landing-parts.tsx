"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Bot, Code2, Compass, Sparkles } from "lucide-react";
import { startTour } from "@/components/tour";

/** The thesis in one interaction: the same agent, seen by an ops lead and by an engineer. */
export function LensDemo() {
  const [lens, setLens] = useState<"simple" | "pro">("simple");
  return (
    <div className="grid gap-4">
      <div role="radiogroup" aria-label="View" className="flex w-fit rounded-lg border border-line bg-surface-2 p-1">
        {([["simple", Sparkles, "Simple"], ["pro", Code2, "Pro"]] as const).map(([v, Icon, label]) => (
          <button key={v} role="radio" aria-checked={lens === v} onClick={() => setLens(v)} className={clsx("flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium", lens === v ? "bg-surface text-ink shadow-sm" : "text-muted")}>
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      <div className="min-h-[260px] rounded-xl border border-line bg-surface p-5">
        {lens === "simple" ? (
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-agent-soft text-agent"><Bot className="size-5" /></span>
              <div className="grid">
                <span className="font-semibold">Fraud Scout</span>
                <span className="text-sm text-muted">Checks each claim against past claims and 42 rules, and explains every flag.</span>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-0.5 rounded-lg bg-good-soft p-3"><span className="text-xs text-good">Report card</span><span className="text-xl font-semibold text-good">91/100</span></div>
              <div className="grid gap-0.5 rounded-lg bg-surface-2 p-3"><span className="text-xs text-muted">May act alone?</span><span className="font-medium">No, suggests only</span></div>
              <div className="grid gap-0.5 rounded-lg bg-surface-2 p-3"><span className="text-xs text-muted">Cost per claim</span><span className="font-medium">1.9 cents</span></div>
            </div>
            <p className="text-sm text-muted">Weakest spot: staged collision rings (88% right). <span className="text-accent">Fix with Architect →</span></p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            <pre className="overflow-x-auto rounded-lg bg-[#07090d] p-4 font-mono text-[12.5px] leading-6 text-[#c9d1e0]">{`# agents/fraud.py  (LangGraph)
fraud_scout = Agent(
  model="claude-opus-5",
  tools=[similar_claims, web_search],
  knowledge=[fraud_rules],
  autonomy="suggest",
  output=RiskAssessment,
)`}</pre>
            <div className="grid content-start gap-2 font-mono text-xs">
              <span className="text-muted">eval fraud · 1,200 simulated claims</span>
              {[["pass", "93.1%"], ["false positives", "2.4%"], ["p95 latency", "4.6 s"], ["cost / claim", "$0.019"]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-line py-1.5"><span className="text-muted">{k}</span><span>{v}</span></div>
              ))}
              <span className="pt-1 text-faint">$ architect eval fraud --simulate 1200</span>
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-muted">Same agent, same project. Simple shows the outcome, Pro shows the code, and both come from one source of truth.</p>
    </div>
  );
}

export function TourButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        startTour();
        router.push("/home");
      }}
      className={clsx("inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-5 text-sm font-medium hover:border-line-strong", className)}
    >
      <Compass className="size-4 text-accent" /> Take the 2-minute tour
    </button>
  );
}
