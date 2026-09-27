"use client";

import { useState } from "react";
import clsx from "clsx";
import { Bot, Check, RotateCcw, UserCheck, X } from "lucide-react";
import { claims } from "@/lib/blueprint";
import type { Plan } from "@/lib/plan";

type Step = { agent: string; did: string; ms: number; cost: string; flag?: boolean };

function claimSteps(id: string): { title: string; steps: Step[]; waiting: boolean } {
  const c = claims.find((x) => x.id === id) ?? claims[0];
  const high = c.risk === "high";
  return {
    title: `${c.customer} · ${c.type}`,
    waiting: high || c.amount > 5000,
    steps: [
      { agent: "Intake Reader", did: `Read the claim email and 3 attachments. Policy found, amount $${c.amount.toLocaleString("en-US")}.`, ms: 2100, cost: "$0.004" },
      { agent: "Fraud Scout", did: high ? "Risk high: prior claim on this address 60 days ago, amount 3× the average, policy is 5 weeks old." : c.risk === "medium" ? "Risk medium: amount above average for this claim type; no prior claims." : "Risk low: first claim in 4 years, amount in the normal range.", ms: 4600, cost: "$0.019", flag: high },
      { agent: "Coverage Checker", did: c.coverage === "Covered" ? "Covered under clause 4.2(b), deductible $250." : c.coverage === "Partial" ? "Partly covered: theft of accessories is excluded (clause 7.1)." : "Needs a person: the policy wording is ambiguous for this incident.", ms: 2800, cost: "$0.007", flag: c.coverage === "Check" },
      { agent: "Router", did: high ? "Sent to Investigations with the three reasons above, and posted in #claims-fraud." : `Assigned to ${c.assignee}, posted a summary in #claims.`, ms: 900, cost: "$0.001" },
    ],
  };
}

function planSteps(plan: Plan, id: string): { title: string; steps: Step[]; waiting: boolean } {
  const unit = plan.data[0]?.replace(/s$/, "").replace(/_/g, " ") || "item";
  const waiting = id.endsWith("1");
  return {
    title: `${unit[0].toUpperCase() + unit.slice(1)} ${id}`,
    waiting,
    steps: plan.agents.map((a, i) => ({
      agent: a.name,
      did: a.autonomy === "suggests" ? `Drafted: ${a.job.charAt(0).toLowerCase() + a.job.slice(1)} Waiting for your approval.` : a.job,
      ms: 900 + i * 700,
      cost: a.model === "Claude Opus 5" ? "$0.018" : a.model === "Claude Haiku 4.5" ? "$0.001" : "$0.007",
      flag: waiting && i === plan.agents.length - 1,
    })),
  };
}

/** What every agent did for one record, with the human decision at the end. */
export function RunDetail({ plan, id, onClose }: { plan: Plan | null; id: string; onClose: () => void }) {
  const data = plan && plan.source !== "blueprint" ? planSteps(plan, id) : claimSteps(id);
  const [decision, setDecision] = useState<null | "approved" | "sent back">(null);
  const total = data.steps.reduce((s, x) => s + x.ms, 0);

  return (
    <aside aria-label="Run details" className="absolute inset-y-0 right-0 z-20 flex w-[min(380px,100%)] flex-col border-l border-line bg-surface shadow-2xl">
      <div className="flex items-start gap-2 border-b border-line p-4">
        <div className="grid flex-1 gap-0.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-faint">What the agents did · {id}</span>
          <span className="font-medium">{data.title}</span>
          <span className="text-xs text-muted">{(total / 1000).toFixed(1)} s end to end · {data.steps.length} agents</span>
        </div>
        <button onClick={onClose} aria-label="Close details" className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"><X className="size-4" /></button>
      </div>
      <ol className="grid flex-1 content-start gap-0 overflow-y-auto p-4">
        {data.steps.map((s, i) => (
          <li key={s.agent} className="relative grid gap-1 pb-5 pl-8">
            {i < data.steps.length - 1 && <span className="absolute top-7 bottom-0 left-3 w-px bg-line" aria-hidden="true" />}
            <span className={clsx("absolute top-0 left-0 grid size-6 place-items-center rounded-md", s.flag ? "bg-warn-soft text-warn" : "bg-agent-soft text-agent")}><Bot className="size-3.5" /></span>
            <span className="text-sm font-medium">{s.agent}</span>
            <span className="text-sm text-muted">{s.did}</span>
            <span className="font-mono text-[11px] text-faint">{(s.ms / 1000).toFixed(1)} s · {s.cost}</span>
          </li>
        ))}
      </ol>
      <div className="grid gap-2 border-t border-line p-4">
        {decision ? (
          <span className="flex items-center gap-2 text-sm text-good"><Check className="size-4" /> {decision === "approved" ? "Approved. The agents will carry on." : "Sent back with your note. The agents will redo it."}</span>
        ) : data.waiting ? (
          <>
            <span className="flex items-center gap-2 text-sm"><UserCheck className="size-4 text-warn" /> Waiting for a person before anything else happens.</span>
            <div className="flex gap-2">
              <button onClick={() => setDecision("approved")} className="flex-1 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-ink">Approve</button>
              <button onClick={() => setDecision("sent back")} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm"><RotateCcw className="size-3.5" /> Send back</button>
            </div>
          </>
        ) : (
          <span className="flex items-center gap-2 text-sm text-muted"><Check className="size-4 text-good" /> Handled by the agents within your rules. Nothing needed a person.</span>
        )}
      </div>
    </aside>
  );
}
