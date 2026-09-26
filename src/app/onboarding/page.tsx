"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowRight, Check, Code2, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { usePrefs, type Lens } from "@/components/providers";
import { Button } from "@/components/ui";
import { saveProfile } from "@/app/actions";

const lensOptions: { value: Lens; icon: typeof Sparkles; title: string; body: string; sample: string[] }[] = [
  {
    value: "simple",
    icon: Sparkles,
    title: "Describe it, I'll review the result",
    body: "Plain-language plans, visual editing and a live preview. No code unless you ask for it.",
    sample: ["✓ Plan approved", "✓ 3 agents ready", "✓ Tested with 1,200 simulated users"],
  },
  {
    value: "pro",
    icon: Code2,
    title: "Show me the code",
    body: "File tree, diffs, terminal, traces and agent config. Branch per task and real pull requests.",
    sample: ["$ architect pull claims-triage", "M  src/agents/fraud.py", "✓ evals 94/100 · p95 1.8s"],
  },
];

const roles = ["Operations", "Sales & marketing", "Support", "Finance", "HR", "Engineering", "Product", "Founder"];
const tools = ["Slack", "Gmail", "HubSpot", "Salesforce", "Jira", "Notion", "Google Sheets", "Zendesk"];

export default function OnboardingPage() {
  const router = useRouter();
  const { lens, setLens } = usePrefs();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const toggleTool = (t: string) =>
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const finish = async () => {
    await saveProfile({ lens, role, tools: picked }).catch(() => {});
    router.push("/home");
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Logo href="/home" />
        <div className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={clsx("h-1 w-8 rounded-full", i <= step ? "bg-accent" : "bg-line")} />
          ))}
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-3xl flex-1 content-center gap-8 px-5 pb-16">
        {step === 0 && (
          <>
            <div className="grid gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">How do you like to build?</h1>
              <p className="text-muted">This sets your default view. You can switch any time from the top bar.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {lensOptions.map(({ value, icon: Icon, title, body, sample }) => (
                <button
                  key={value}
                  onClick={() => setLens(value)}
                  aria-pressed={lens === value}
                  className={clsx(
                    "grid gap-4 rounded-xl border bg-surface p-5 text-left transition-colors",
                    lens === value ? "border-accent ring-1 ring-accent" : "border-line hover:border-line-strong",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-accent" />
                    <span className={clsx("grid size-5 place-items-center rounded-full border", lens === value ? "border-accent bg-accent text-accent-ink" : "border-line-strong")}>
                      {lens === value && <Check className="size-3" />}
                    </span>
                  </div>
                  <div className="grid gap-1">
                    <span className="font-semibold">{title}</span>
                    <span className="text-sm text-muted">{body}</span>
                  </div>
                  <div className={clsx("grid gap-1 rounded-md bg-surface-2 p-3 text-xs", value === "pro" ? "font-mono" : "")}>
                    {sample.map((line) => <span key={line} className="text-muted">{line}</span>)}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">What do you work on?</h1>
              <p className="text-muted">We use this to suggest agents that save you time. Optional.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                  className={clsx("rounded-full border px-4 py-2 text-sm", role === r ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:border-line-strong")}
                >
                  {r}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">Which tools should your agents work with?</h1>
              <p className="text-muted">Pick any. You connect them later, only when an agent needs one.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {tools.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTool(t)}
                  aria-pressed={picked.includes(t)}
                  className={clsx("flex items-center justify-between rounded-lg border px-3 py-3 text-sm", picked.includes(t) ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong")}
                >
                  {t}
                  {picked.includes(t) && <Check className="size-4 text-accent" />}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => (step === 0 ? finish() : setStep(step - 1))}>
            {step === 0 ? "Skip setup" : "Back"}
          </Button>
          <Button variant="primary" onClick={() => (step === 2 ? finish() : setStep(step + 1))}>
            {step === 2 ? "Go to my workspace" : "Continue"} <ArrowRight className="size-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
