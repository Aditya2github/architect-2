"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowRight, Check, Clock, Coins, FileText, Layers, LayoutPanelTop, Loader2, Receipt, Sparkles, Table2, Workflow } from "lucide-react";
import { AgentFlow } from "@/components/agent-flow";
import { MockClaimsApp } from "@/components/mock-app";
import { usePrefs } from "@/components/providers";
import { agents, estimate, fileTree, planSummary, scopingQuestions } from "@/lib/blueprint";
import { Button } from "@/components/ui";

type Tab = "plan" | "agents" | "mockup" | "schema" | "files";

export function PlanView({ projectId, idea }: { projectId: string; idea: string | null }) {
  const router = useRouter();
  const { lens } = usePrefs();
  const isNew = projectId === "new";

  // Existing projects open with the plan already agreed; new ones start with questions.
  const [answers, setAnswers] = useState<(string | null)[]>(
    isNew ? scopingQuestions.map(() => null) : scopingQuestions.map((q) => q.answer),
  );
  const answered = answers.every(Boolean);
  const [drafting, setDrafting] = useState(false);
  const [ready, setReady] = useState(!isNew);
  const [tab, setTab] = useState<Tab>("plan");

  useEffect(() => {
    if (!answered || ready) return;
    const start = setTimeout(() => setDrafting(true), 0);
    const done = setTimeout(() => {
      setDrafting(false);
      setReady(true);
    }, 1800);
    return () => {
      clearTimeout(start);
      clearTimeout(done);
    };
  }, [answered, ready]);

  const tabs: { id: Tab; label: string; icon: typeof FileText; pro?: boolean }[] = [
    { id: "plan", label: "Plan", icon: FileText },
    { id: "agents", label: "Agents", icon: Workflow },
    { id: "mockup", label: "Mockup", icon: LayoutPanelTop },
    { id: "schema", label: "Data & API", icon: Table2, pro: true },
    { id: "files", label: "File plan", icon: Layers, pro: true },
  ];
  const visibleTabs = tabs.filter((t) => !t.pro || lens === "pro");
  const activeTab = visibleTabs.some((t) => t.id === tab) ? tab : "plan";

  return (
    <div className="grid min-h-full lg:grid-cols-[380px_minmax(0,1fr)]">
      {/* Conversation */}
      <section className="flex flex-col gap-5 border-b border-line bg-surface p-5 lg:border-r lg:border-b-0">
        <div className="grid gap-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-faint">Your idea</span>
          <p className="text-sm">{idea ?? "An agent that reads new insurance claims, flags the suspicious ones and routes each to the right adjuster."}</p>
        </div>

        <div className="grid gap-4">
          <div className="flex items-start gap-2 text-sm">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>A few quick questions so the plan fits how your team works.</p>
          </div>
          {scopingQuestions.map((q, i) => (
            <div key={q.q} className="grid gap-2">
              <span className="text-sm font-medium">{q.q}</span>
              <div className="flex flex-wrap gap-1.5">
                {q.options.map((o) => (
                  <button
                    key={o}
                    onClick={() => setAnswers((a) => a.map((v, j) => (j === i ? o : v)))}
                    aria-pressed={answers[i] === o}
                    className={clsx(
                      "rounded-full border px-3 py-1 text-xs",
                      answers[i] === o ? "border-accent bg-accent-soft text-accent" : "border-line hover:border-line-strong",
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {(drafting || ready) && (
          <div className="flex items-start gap-2 rounded-lg bg-surface-2 p-3 text-sm">
            {drafting ? <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-accent" /> : <Check className="mt-0.5 size-4 shrink-0 text-good" />}
            <p>{drafting ? "Drafting your plan…" : "Plan ready. Review it on the right, ask for changes below, or approve it."}</p>
          </div>
        )}

        <form
          className="mt-auto flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label htmlFor="plan-chat" className="sr-only">Ask for a change to the plan</label>
          <input id="plan-chat" placeholder="Ask for a change, e.g. also handle health claims" className="h-9 flex-1 rounded-md border border-line bg-bg px-3 text-sm outline-none placeholder:text-faint focus:border-accent" />
          <Button type="submit" size="md">Send</Button>
        </form>
      </section>

      {/* Plan document */}
      <section className="flex min-w-0 flex-col">
        <div className="flex gap-1 overflow-x-auto border-b border-line px-4 pt-3">
          {visibleTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={clsx(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 text-sm",
                activeTab === id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-5 md:p-8">
          {!ready ? (
            <div className="grid gap-3" aria-busy={drafting}>
              <p className="text-sm text-muted">{drafting ? "Writing the plan, choosing agents and sketching screens…" : "Answer the questions on the left and your plan appears here."}</p>
              {[80, 60, 90, 45].map((w) => (
                <div key={w} className={clsx("h-4 rounded bg-surface-2", drafting && "animate-pulse")} style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <PlanTab tab={activeTab} />
          )}
        </div>

        {ready && (
          <div className="sticky bottom-0 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line bg-surface/95 px-5 py-3 backdrop-blur">
            <Stat icon={Coins} label="Build" value={estimate.buildCost} />
            <Stat icon={Clock} label="Time" value={estimate.buildTime} />
            <Stat icon={Receipt} label="Per claim" value={estimate.perRun} />
            <span className="hidden text-xs text-faint xl:inline">{estimate.monthly}</span>
            <Button variant="primary" className="ml-auto" onClick={() => router.push(`/p/${isNew ? "claims-triage" : projectId}?build=1`)}>
              Approve &amp; build <ArrowRight className="size-4" />
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

function PlanTab({ tab }: { tab: Tab }) {
  if (tab === "agents") {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AgentFlow />
        <div className="grid content-start gap-3">
          {agents.map((a) => (
            <div key={a.id} className="grid gap-1 rounded-lg border border-line bg-surface p-3">
              <span className="text-sm font-medium">{a.name}</span>
              <span className="text-sm text-muted">{a.job}</span>
              <span className="font-mono text-[11px] text-faint">{a.model}{a.knowledge ? ` · reads ${a.knowledge}` : ""}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (tab === "mockup") {
    return (
      <div className="grid gap-3">
        <p className="text-sm text-muted">A clickable sketch of the main screen. Real data appears once it&apos;s built.</p>
        <div className="rounded-xl border border-line bg-surface-2 p-3"><MockClaimsApp /></div>
      </div>
    );
  }
  if (tab === "schema") {
    return (
      <div className="grid gap-5 font-mono text-sm">
        <div className="grid gap-2">
          <span className="text-xs uppercase tracking-wider text-faint">Tables</span>
          {["claims (id, policy_id, customer, type, amount, risk, coverage, assignee)", "claim_flags (claim_id, rule, evidence_url, agent)", "adjusters (name, team, open_claims)"].map((t) => (
            <code key={t} className="rounded-md border border-line bg-surface px-3 py-2">{t}</code>
          ))}
        </div>
        <div className="grid gap-2">
          <span className="text-xs uppercase tracking-wider text-faint">API</span>
          {["POST /api/claims        new claim → runs agent graph", "GET  /api/claims?mine   adjuster queue", "POST /api/claims/:id/route  manual reassign"].map((t) => (
            <code key={t} className="rounded-md border border-line bg-surface px-3 py-2 whitespace-pre">{t}</code>
          ))}
        </div>
        <p className="font-sans text-sm text-muted">Framework: <span className="text-ink">LangGraph</span> (change on the Agents screen). Row-level security on every table.</p>
      </div>
    );
  }
  if (tab === "files") {
    return <pre className="overflow-x-auto rounded-lg border border-line bg-surface p-4 font-mono text-sm leading-6 text-muted">{fileTree.join("\n")}</pre>;
  }
  return (
    <article className="grid max-w-3xl gap-6">
      <h2 className="text-2xl font-semibold tracking-tight">{planSummary.title}</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        {[
          ["Who it's for", planSummary.forWho],
          ["The problem", planSummary.problem],
        ].map(([k, v]) => (
          <div key={k} className="grid gap-1 rounded-lg border border-line bg-surface p-4">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-faint">{k}</dt>
            <dd className="text-sm">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-1 rounded-lg border border-accent/40 bg-accent-soft p-4">
        <span className="font-mono text-[11px] uppercase tracking-wider text-accent">Done looks like</span>
        <p className="text-sm">{planSummary.outcome}</p>
      </div>
      <div className="grid gap-2">
        <h3 className="font-semibold">User stories</h3>
        <ul className="grid gap-2 text-sm text-muted">
          {planSummary.stories.map((s) => <li key={s} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-good" />{s}</li>)}
        </ul>
      </div>
      <div className="grid gap-2">
        <h3 className="font-semibold">Screens</h3>
        <div className="flex flex-wrap gap-2">
          {planSummary.screens.map((s) => <span key={s} className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm">{s}</span>)}
        </div>
      </div>
    </article>
  );
}
