"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowRight, Bot, Check, Clock, Coins, Loader2, Receipt, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { Button } from "@/components/ui";
import { scopingQuestions, type Autonomy, type Plan, type PlanAnswers } from "@/lib/plan";
import { savePlan, useProjectPlan } from "@/lib/use-plan";

const autonomyLabel: Record<Autonomy, { label: string; className: string }> = {
  suggests: { label: "Suggests only", className: "bg-surface-2 text-muted" },
  asks: { label: "Asks you first", className: "bg-accent-soft text-accent" },
  acts: { label: "Acts, then reports", className: "bg-agent-soft text-agent" },
};

export function PlanView({ projectId, idea }: { projectId: string; idea: string | null }) {
  const router = useRouter();
  const { lens } = usePrefs();
  const saved = useProjectPlan(projectId);
  const [answers, setAnswers] = useState<Partial<PlanAnswers>>({});
  const [status, setStatus] = useState<"idle" | "drafting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [change, setChange] = useState("");

  // A fresh idea always gets a fresh plan; otherwise show what was already agreed.
  const [fresh, setFresh] = useState(Boolean(idea));
  const plan = fresh ? null : saved;
  const allAnswered = scopingQuestions.every((q) => answers[q.key]);
  const basePrompt = idea ?? saved?.summary ?? "";

  const draft = async (extra?: string) => {
    setStatus("drafting");
    setError(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: extra ? `${basePrompt}\n\nRequested change: ${extra}` : basePrompt,
          answers: { users: "My team", autonomy: "Act on low-risk only", intake: "Email or chat", ...answers },
        }),
      });
      const body = (await res.json()) as { plan?: Plan; error?: string };
      if (!res.ok || !body.plan) throw new Error(body.error ?? "The plan couldn't be drafted.");
      savePlan(projectId, body.plan);
      setFresh(false);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "The plan couldn't be drafted.");
    }
  };

  const answer = (key: keyof PlanAnswers, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
  };

  return (
    <div className="grid min-h-full lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* Conversation */}
      <section className="flex flex-col gap-5 border-b border-line bg-surface p-5 lg:border-r lg:border-b-0">
        <div className="grid gap-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-faint">Your idea</span>
          <p className="text-sm">{basePrompt || "Describe your idea on the home screen to get a plan."}</p>
        </div>

        {fresh && (
          <div className="grid gap-4">
            <div className="flex items-start gap-2 text-sm">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
              <p>Three quick questions, then I&apos;ll write the plan for you to sign off.</p>
            </div>
            {scopingQuestions.map((q) => (
              <div key={q.key} className="grid gap-2">
                <span className="text-sm font-medium">{q.q}</span>
                <div className="flex flex-wrap gap-1.5">
                  {q.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => answer(q.key, o)}
                      aria-pressed={answers[q.key] === o}
                      className={clsx("rounded-full border px-3 py-1 text-xs", answers[q.key] === o ? "border-accent bg-accent-soft text-accent" : "border-line hover:border-line-strong")}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <Button variant="primary" disabled={!allAnswered || status === "drafting"} onClick={() => draft()}>
              {status === "drafting" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {status === "drafting" ? "Writing your plan…" : "Write the plan"}
            </Button>
          </div>
        )}

        {!fresh && plan && (
          <form
            className="grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (change.trim()) draft(change.trim().slice(0, 300));
            }}
          >
            <label htmlFor="plan-change" className="text-sm font-medium">Want something different?</label>
            <textarea
              id="plan-change"
              rows={3}
              value={change}
              onChange={(e) => setChange(e.target.value)}
              placeholder="e.g. Nothing goes to customers without my approval"
              className="resize-none rounded-md border border-line bg-bg px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-accent"
            />
            <Button type="submit" disabled={!change.trim() || status === "drafting"}>
              {status === "drafting" ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              {status === "drafting" ? "Rewriting…" : "Rewrite the plan"}
            </Button>
          </form>
        )}

        {error && <p role="alert" className="rounded-md bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}
      </section>

      {/* The contract */}
      <section className="flex min-w-0 flex-col">
        <div className="flex-1 p-5 md:p-8">
          {!plan ? (
            <div className="grid max-w-3xl gap-3" aria-busy={status === "drafting"}>
              <p className="text-sm text-muted">
                {status === "drafting" ? "Choosing agents, deciding what each may do on its own, and pricing it…" : "Your plan appears here. Nothing is built until you sign it."}
              </p>
              {[80, 55, 90, 40, 70].map((w) => (
                <div key={w} className={clsx("h-4 rounded bg-surface-2", status === "drafting" && "animate-pulse")} style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <Contract plan={plan} pro={lens === "pro"} />
          )}
        </div>

        {plan && (
          <div className="sticky bottom-0 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line bg-surface/95 px-5 py-3 backdrop-blur">
            <Stat icon={Coins} label="To build" value={`$${plan.estimate.buildCost.toFixed(2)}`} />
            <Stat icon={Clock} label="Time" value={`~${Math.round(plan.estimate.buildMinutes)} min`} />
            <Stat icon={Receipt} label="Per run" value={`$${plan.estimate.costPerRun.toFixed(3)}`} />
            <Button variant="primary" className="ml-auto" onClick={() => router.push(`/p/${projectId}?build=1`)}>
              Sign &amp; build <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Coins; label: string; value: string }) {
  return (
    <span className="flex items-center gap-2 text-sm">
      <Icon className="size-4 text-faint" />
      <span className="text-muted">{label}</span>
      <span className="font-mono font-medium tabular-nums">{value}</span>
    </span>
  );
}

function Contract({ plan, pro }: { plan: Plan; pro: boolean }) {
  const sourceLabel = plan.source === "claude" ? "Written by Claude from your answers" : plan.source === "blueprint" ? "From the Claims Triage blueprint" : "Quick draft from your idea";
  return (
    <article className="grid max-w-4xl gap-8">
      <header className="grid gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-faint">Build plan · {sourceLabel}</span>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{plan.title}</h1>
        <p className="text-muted">{plan.summary}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ["Who it's for", plan.forWho],
          ["What's wrong today", plan.problem],
          ["Done looks like", plan.outcome],
        ].map(([k, v], i) => (
          <div key={k} className={clsx("grid content-start gap-1 rounded-lg border p-4", i === 2 ? "border-accent/40 bg-accent-soft" : "border-line bg-surface")}>
            <span className={clsx("font-mono text-[11px] uppercase tracking-wider", i === 2 ? "text-accent" : "text-faint")}>{k}</span>
            <span className="text-sm">{v}</span>
          </div>
        ))}
      </div>

      <section className="grid gap-3">
        <div className="grid gap-1">
          <h2 className="text-lg font-semibold">The agents, and what each may do on its own</h2>
          <p className="text-sm text-muted">You decide how much independence each agent gets. Change it any time on the Agents screen.</p>
        </div>
        <div className="grid gap-2">
          {plan.agents.map((a) => (
            <div key={a.name} className="grid gap-2 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="grid gap-1">
                <span className="flex items-center gap-2 font-medium">
                  <span className="grid size-6 place-items-center rounded-md bg-agent-soft text-agent"><Bot className="size-3.5" /></span>
                  {a.name}
                </span>
                <span className="text-sm text-muted">{a.job}</span>
                {(a.tools.length > 0 || pro) && (
                  <span className="flex flex-wrap gap-1.5 pt-1">
                    {a.tools.map((t) => <span key={t} className="rounded border border-line px-1.5 py-0.5 text-xs text-muted">{t}</span>)}
                    {pro && <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-faint">{a.model}</span>}
                  </span>
                )}
              </div>
              <span className={clsx("justify-self-start rounded-full px-2.5 py-1 text-xs font-medium", autonomyLabel[a.autonomy]?.className ?? "bg-surface-2 text-muted")}>
                {autonomyLabel[a.autonomy]?.label ?? a.autonomy}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">What could go wrong, and what stops it</h2>
        <div className="grid gap-2">
          {plan.risks.map((r) => (
            <div key={r.risk} className="grid gap-1 rounded-lg border border-line bg-surface p-4 text-sm md:grid-cols-2 md:gap-6">
              <span>{r.risk}</span>
              <span className="flex gap-2 text-muted"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-good" />{r.safeguard}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="grid content-start gap-2">
          <h2 className="text-lg font-semibold">Who can do what</h2>
          <ul className="grid gap-2 text-sm text-muted">
            {plan.stories.map((s) => <li key={s} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-good" />{s}</li>)}
          </ul>
        </div>
        <div className="grid content-start gap-2">
          <h2 className="text-lg font-semibold">Screens</h2>
          <div className="flex flex-wrap gap-2">
            {plan.screens.map((s) => <span key={s} className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm">{s}</span>)}
          </div>
        </div>
      </section>

      {pro && (
        <section className="grid gap-2">
          <h2 className="text-lg font-semibold">Data</h2>
          <div className="flex flex-wrap gap-2 font-mono text-sm">
            {plan.data.map((t) => <code key={t} className="rounded-md border border-line bg-surface px-2.5 py-1">{t}</code>)}
          </div>
          <p className="text-sm text-muted">Every table gets row-level security, so each person only sees their own records.</p>
        </section>
      )}
    </article>
  );
}
