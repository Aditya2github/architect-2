"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";

const roles = ["Claims operations", "Sales", "Customer support", "Finance", "HR & recruiting", "Marketing"];

const sinks: Record<string, string[]> = {
  "Claims operations": ["Sorting new claims", "Chasing missing documents", "Checking coverage", "Writing claim summaries"],
  Sales: ["Researching leads", "Writing first emails", "Updating the CRM", "Preparing for calls"],
  "Customer support": ["Answering repeat questions", "Tagging tickets", "Escalating angry customers", "Writing macros"],
  Finance: ["Matching invoices", "Chasing approvals", "Month-end reports", "Expense checks"],
  "HR & recruiting": ["Screening resumes", "Scheduling interviews", "Answering policy questions", "Onboarding paperwork"],
  Marketing: ["Writing posts", "Competitor tracking", "Reporting on campaigns", "Repurposing content"],
};

const tools = ["Gmail", "Outlook", "Slack", "Teams", "Salesforce", "HubSpot", "Zendesk", "Google Sheets", "Jira"];

export default function DecidePage() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(roles[0]);
  const [pains, setPains] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const chosen = pains.length ? pains : sinks[role].slice(0, 3);
  const toolText = stack.length ? stack.slice(0, 2).join(" and ") : "your inbox";
  const proposals = chosen.slice(0, 3).map((p, i) => ({
    title: `${p} agent`,
    body: `Takes over "${p.toLowerCase()}" for your ${role.toLowerCase()} team, working from ${toolText}. It drafts, you approve.`,
    hours: [9, 6, 4][i],
    prompt: `An agent for a ${role.toLowerCase()} team that handles ${p.toLowerCase()} using ${toolText}. It should draft the work and let a person approve it.`,
  }));

  return (
    <div className="grid max-w-3xl gap-8">
      <div className="grid gap-1">
        <span className="font-mono text-xs uppercase tracking-wider text-accent">Help me decide · step {Math.min(step + 1, 3)} of 3</span>
        <h1 className="text-3xl font-semibold tracking-tight">
          {step === 0 && "What's your team?"}
          {step === 1 && "Where does the week go?"}
          {step === 2 && "Which tools do you live in?"}
          {step === 3 && "Three agents that would save you the most time"}
        </h1>
      </div>

      {step === 0 && (
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button key={r} onClick={() => { setRole(r); setPains([]); }} aria-pressed={role === r} className={clsx("rounded-full border px-4 py-2 text-sm", role === r ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface")}>{r}</button>
          ))}
        </div>
      )}
      {step === 1 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {sinks[role].map((s) => (
            <button key={s} onClick={() => toggle(pains, setPains, s)} aria-pressed={pains.includes(s)} className={clsx("rounded-lg border px-4 py-3 text-left text-sm", pains.includes(s) ? "border-accent bg-accent-soft" : "border-line bg-surface")}>{s}</button>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-wrap gap-2">
          {tools.map((t) => (
            <button key={t} onClick={() => toggle(stack, setStack, t)} aria-pressed={stack.includes(t)} className={clsx("rounded-full border px-4 py-2 text-sm", stack.includes(t) ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface")}>{t}</button>
          ))}
        </div>
      )}
      {step === 3 && (
        <div className="grid gap-3">
          {proposals.map((p) => (
            <div key={p.title} className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-surface p-4">
              <div className="grid min-w-0 flex-1 gap-1">
                <span className="font-medium">{p.title}</span>
                <span className="text-sm text-muted">{p.body}</span>
              </div>
              <span className="flex items-center gap-1.5 text-sm text-good"><Clock className="size-4" /> ~{p.hours} h / week</span>
              <Link href={`/p/new/plan?prompt=${encodeURIComponent(p.prompt)}`} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-medium text-accent-ink">
                Plan this <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
          <p className="text-xs text-faint">Estimates assume the agent drafts and a person approves. You&apos;ll see a cost estimate before anything is built.</p>
        </div>
      )}

      {step < 3 && (
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
          <Button
            variant="primary"
            disabled={thinking}
            onClick={() => {
              if (step < 2) return setStep(step + 1);
              setThinking(true);
              setTimeout(() => { setThinking(false); setStep(3); }, 1200);
            }}
          >
            {thinking ? <Loader2 className="size-4 animate-spin" /> : null}
            {step < 2 ? "Continue" : thinking ? "Finding the best fits…" : "Show me"}
          </Button>
        </div>
      )}
    </div>
  );
}
