"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Circle, FolderGit2, Loader2, Lock } from "lucide-react";

const repos = [
  { name: "acme-insurance/claims-portal", stack: "Next.js 15 · TypeScript", updated: "2 days ago" },
  { name: "acme-insurance/underwriting-bot", stack: "Python · FastAPI · CrewAI", updated: "1 week ago" },
  { name: "acme-insurance/broker-app", stack: "React Native · Expo", updated: "3 weeks ago" },
];

const steps = [
  "Cloning the repository",
  "Detecting the stack: Python 3.12, FastAPI, CrewAI (3 agents)",
  "Installing dependencies in a sandbox",
  "Running the existing tests: 52 passed, 2 skipped",
  "Reading the codebase and mapping the agents",
];

export function ImportView() {
  const [picked, setPicked] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!picked || step >= steps.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), 800);
    return () => clearTimeout(t);
  }, [picked, step]);

  const done = picked && step >= steps.length;

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-8 md:px-8">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Import a project</h1>
        <p className="text-sm text-muted">Any stack. Architect reads your code, runs your tests, and picks up where you left off.</p>
      </div>

      {!picked ? (
        <div className="grid gap-2">
          {repos.map((r) => (
            <button key={r.name} onClick={() => setPicked(r.name)} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-left hover:border-line-strong">
              <FolderGit2 className="size-5 text-faint" />
              <div className="grid">
                <span className="flex items-center gap-2 font-mono text-sm"><Lock className="size-3 text-faint" />{r.name}</span>
                <span className="text-xs text-muted">{r.stack} · updated {r.updated}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 rounded-xl border border-line bg-surface p-5">
          <span className="font-mono text-sm">{picked}</span>
          <ol className="grid gap-2 text-sm">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2.5">
                {i < step ? <Check className="size-4 text-good" /> : i === step ? <Loader2 className="size-4 animate-spin text-accent" /> : <Circle className="size-4 text-line-strong" />}
                <span className={i > step ? "text-faint" : ""}>{s}</span>
              </li>
            ))}
          </ol>
          {done && (
            <div className="grid gap-3 border-t border-line pt-4 text-sm">
              <p>I found 3 CrewAI agents with no evals yet. Suggested first step: generate a test set from your last 500 underwriting cases and score each agent.</p>
              <Link href="/p/claims-triage/agents" className="inline-flex h-9 items-center justify-self-start rounded-md bg-accent px-4 text-sm font-medium text-accent-ink">Open project</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
