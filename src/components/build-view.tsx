"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  ArrowUp, Check, Circle, History, Loader2, Monitor, MousePointerClick, RotateCcw, Smartphone, Sparkles, Tablet, Undo2,
} from "lucide-react";
import { usePrefs } from "@/components/providers";
import { MockClaimsApp } from "@/components/mock-app";
import { CodePanel, LogsPanel, TerminalPanel } from "@/components/code-panel";
import { buildSteps as claimsSteps, checkpoints, type BuildStep } from "@/lib/blueprint";
import { PlanApp } from "@/components/plan-app";
import { claimsPlan, type Plan } from "@/lib/plan";
import { Dialog } from "@/components/dialog";
import { FileText } from "lucide-react";
import { useProjectPlan } from "@/lib/use-plan";
import { useAppTheme } from "@/lib/app-theme";
import { RunDetail } from "@/components/run-detail";
import { buildReport } from "@/lib/agent-report";
import { FlaskConical, ShieldCheck, Wallet } from "lucide-react";

type Msg =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string }
  | { kind: "estimate"; text: string; cost: string; id: number; used?: boolean }
  | { kind: "timeline" }
  | { kind: "artifact"; title: string };

type Phase = "idle" | "building" | "done";
type View = "preview" | "code" | "terminal" | "logs";
type Device = "desktop" | "tablet" | "phone";

const deviceWidth: Record<Device, string> = { desktop: "100%", tablet: "768px", phone: "390px" };

function stepsFor(plan: Plan | null): BuildStep[] {
  if (!plan || plan.source === "blueprint") return claimsSteps;
  const names = plan.agents.map((a) => a.name);
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return [
    { id: "scaffold", label: "Setting up the project", detail: `App, sign-in and ${plan.data.length} data tables`, files: ["package.json", "src/app/layout.tsx", "db/schema.sql"], seconds: 2 },
    { id: "agents", label: `Creating ${names.length} agents`, detail: names.join(", "), files: names.map((n) => `agents/${slug(n)}.py`), seconds: 3 },
    { id: "ui", label: "Building the screens", detail: plan.screens.join(", "), files: plan.screens.slice(0, 3).map((s) => `src/app/${slug(s)}/page.tsx`), seconds: 3 },
    { id: "wire", label: "Connecting agents to the screens", detail: "Screens update live as agents finish", files: ["src/app/api/runs/route.ts", "src/lib/agents.ts"], seconds: 2 },
    { id: "test", label: "Testing in a real browser", detail: "Browser checks and 1,200 simulated cases", files: ["tests/app.spec.ts", "evals/agents.yaml"], seconds: 3 },
    { id: "verify", label: "Verified", detail: "No console errors, all screens load, evals passed", files: [], seconds: 1 },
  ];
}

function seedFor(plan: Plan | null): Msg[] {
  if (!plan || plan.source === "blueprint")
    return [
      { kind: "user", text: "Make the Fraud Scout explain every flag with a link to the evidence." },
      { kind: "assistant", text: "Done. Fraud Scout now returns one line per reason with an evidence link, and I moved it to a stronger model for accuracy. Eval score went from 86 to 91. Saved as a checkpoint." },
    ];
  const a = plan.agents[Math.min(1, plan.agents.length - 1)];
  return [
    { kind: "user", text: `Make the ${a.name} explain each decision it makes.` },
    { kind: "assistant", text: `Done. ${a.name} now writes one line per decision with a link to what it used. Evals re-ran and it passed. Saved as a checkpoint.` },
  ];
}

export function BuildView({ projectId, projectName, autoBuild }: { projectId: string; projectName: string; autoBuild: boolean }) {
  const { lens } = usePrefs();
  const plan = useProjectPlan(projectId);
  const buildSteps = useMemo(() => stepsFor(plan), [plan]);
  const generic = Boolean(plan && plan.source !== "blueprint");
  const appName = plan && projectId === "new" ? plan.title : projectName;
  const host = appName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-app";
  const [pane, setPane] = useState<"chat" | "preview">("chat");
  const appTheme = useAppTheme();
  const [openRun, setOpenRun] = useState<string | null>(null);
  const evalScore = buildReport(plan).overall;
  const [messages, setMessages] = useState<Msg[]>(() => (autoBuild ? [{ kind: "assistant", text: "Plan signed. Building now; you can keep chatting while I work." }, { kind: "timeline" }] : seedFor(plan)));
  const [phase, setPhase] = useState<Phase>(autoBuild ? "building" : "done");
  const [step, setStep] = useState(autoBuild ? 0 : 99);
  const [view, setView] = useState<View>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [picking, setPicking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Advance the build one step at a time.
  useEffect(() => {
    if (phase !== "building") return;
    if (step >= buildSteps.length) {
      const t = setTimeout(() => {
        setPhase("done");
        setMessages((m) => [...m, { kind: "assistant", text: generic ? `${appName} is built and verified: 18 browser checks passed, and all ${plan!.agents.length} agents passed their evals on 1,200 simulated cases. Saved as a checkpoint. Try it in the preview.` : "Your app is built and verified: 18 browser checks passed, and the agents scored 94/100 on 1,200 simulated claims. Saved as a checkpoint. Try it in the preview." }]);
        setPane("preview");
      }, 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), buildSteps[step].seconds * 700);
    return () => clearTimeout(t);
  }, [phase, step, buildSteps, generic, appName, plan]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, step]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setDraft("");
    setMessages((m) => [
      ...m,
      { kind: "user", text: t },
      { kind: "estimate", id: Date.now(), text: `Here's what I'll change: update ${generic ? `the ${plan!.screens[0]} screen` : "the claims table"} and its API, then re-run the browser checks.`, cost: "$0.42" },
    ]);
  };

  const effectivePlan = plan ?? claimsPlan;
  const [doc, setDoc] = useState(false);

  // Questions and documents are free; only changes to the app cost credits.
  const quick = (kind: "doc" | "risks" | "explain") => {
    if (kind === "doc")
      setMessages((m) => [...m, { kind: "user", text: "Write a one-pager I can send my manager." }, { kind: "artifact", title: `${effectivePlan.title}: one-pager` }]);
    if (kind === "risks")
      setMessages((m) => [...m, { kind: "user", text: "What could break?" }, { kind: "assistant", text: effectivePlan.risks.map((r, i) => `${i + 1}. ${r.risk}. Guard: ${r.safeguard}.`).join(" ") }]);
    if (kind === "explain")
      setMessages((m) => [...m, { kind: "user", text: "Explain this app like I'm new here." }, { kind: "assistant", text: `${effectivePlan.summary} ${effectivePlan.agents.length} agents share the work: ${effectivePlan.agents.map((a) => `${a.name} (${a.job.charAt(0).toLowerCase() + a.job.slice(1, 80).replace(/\.$/, "")})`).join("; ")}.` }]);
  };

  const startBuild = (id: number) => {
    setMessages((m) => [...m.map((x) => (x.kind === "estimate" && x.id === id ? { ...x, used: true } : x)), { kind: "timeline" }]);
    setStep(0);
    setPhase("building");
  };

  const lastTimeline = messages.map((m) => m.kind).lastIndexOf("timeline");
  const views: { id: View; label: string }[] =
    lens === "pro"
      ? [{ id: "preview", label: "Preview" }, { id: "code", label: "Code" }, { id: "terminal", label: "Terminal" }, { id: "logs", label: "Logs" }]
      : [{ id: "preview", label: "Preview" }];
  const activeView = views.some((v) => v.id === view) ? view : "preview";

  return (
    <div className="flex h-full min-h-0 flex-col lg:grid lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* Phones show one pane at a time */}
      <div className="flex shrink-0 gap-1 border-b border-line bg-surface p-2 lg:hidden" role="tablist" aria-label="Workspace">
        {(["chat", "preview"] as const).map((p) => (
          <button key={p} role="tab" aria-selected={pane === p} onClick={() => setPane(p)} className={clsx("flex-1 rounded-md py-1.5 text-sm capitalize", pane === p ? "bg-surface-2 text-ink" : "text-muted")}>
            {p}
            {p === "preview" && phase === "building" && <Loader2 className="ml-1.5 inline size-3.5 animate-spin text-accent" />}
          </button>
        ))}
      </div>
      <Dialog open={doc} onClose={() => setDoc(false)} title={`${effectivePlan.title}: one-pager`} description="Generated from the signed plan. Copy it into an email or doc." size="lg">
        <article id="one-pager" className="grid gap-4 text-sm">
          <p className="text-base">{effectivePlan.summary}</p>
          <div className="grid gap-1"><b>The problem</b><p className="text-muted">{effectivePlan.problem}</p></div>
          <div className="grid gap-1"><b>What changes</b><p className="text-muted">{effectivePlan.outcome}</p></div>
          <div className="grid gap-1"><b>How it works</b>
            <ul className="grid gap-1 pl-4 text-muted">{effectivePlan.agents.map((a) => <li key={a.name} className="list-disc"><span className="text-ink">{a.name}</span>: {a.job}</li>)}</ul>
          </div>
          <div className="grid gap-1"><b>Risks and how we control them</b>
            <ul className="grid gap-1 pl-4 text-muted">{effectivePlan.risks.map((r) => <li key={r.risk} className="list-disc">{r.risk}. {r.safeguard}.</li>)}</ul>
          </div>
          <div className="grid gap-1"><b>Cost</b><p className="text-muted">About ${effectivePlan.estimate.costPerRun.toFixed(3)} per run to operate, ${effectivePlan.estimate.buildCost.toFixed(2)} to build, capped by a monthly spending limit.</p></div>
        </article>
        <div className="flex justify-end">
          <button
            onClick={() => {
              const text = document.getElementById("one-pager")?.innerText ?? "";
              navigator.clipboard?.writeText(text).catch(() => {});
              setDoc(false);
            }}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
          >
            Copy text
          </button>
        </div>
      </Dialog>
      {/* Chat */}
      <section className={clsx("min-h-0 flex-1 flex-col bg-surface lg:flex lg:border-r lg:border-line", pane === "chat" ? "flex" : "hidden")}>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m, i) => {
            if (m.kind === "user") return <div key={i} className="ml-8 rounded-lg bg-accent-soft px-3 py-2 text-sm">{m.text}</div>;
            if (m.kind === "assistant")
              return (
                <div key={i} className="flex gap-2 text-sm">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
                  <p>{m.text}</p>
                </div>
              );
            if (m.kind === "estimate")
              return (
                <div key={i} className="grid gap-3 rounded-lg border border-line p-3 text-sm">
                  <p>{m.text}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Estimated cost</span>
                    <span className="font-mono font-medium">{m.cost}</span>
                    {m.used ? (
                      <span className="ml-auto text-xs text-faint">Approved</span>
                    ) : (
                      <button onClick={() => startBuild(m.id)} disabled={phase === "building"} className="ml-auto rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-ink disabled:opacity-40">
                        Build it
                      </button>
                    )}
                  </div>
                </div>
              );
            if (m.kind === "artifact")
              return (
                <button key={i} onClick={() => setDoc(true)} className="flex w-full items-center gap-3 rounded-lg border border-line p-3 text-left text-sm hover:border-accent">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-soft text-accent"><FileText className="size-4" /></span>
                  <span className="grid"><span className="font-medium">{m.title}</span><span className="text-xs text-muted">Document · free · click to open</span></span>
                </button>
              );
            return <Timeline key={i} steps={buildSteps} step={i === lastTimeline ? step : buildSteps.length} pro={lens === "pro"} />;
          })}
          <div ref={endRef} />
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-line px-3 pt-3" aria-label="Quick asks">
          {([["doc", "One-pager for my manager"], ["risks", "What could break?"], ["explain", "Explain this app"]] as const).map(([k, label]) => (
            <button key={k} type="button" onClick={() => quick(k)} className="shrink-0 rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:border-accent hover:text-ink">{label}</button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="p-3 pt-2"
        >
          <div className="rounded-lg border border-line bg-bg focus-within:border-accent">
            <label htmlFor="build-chat" className="sr-only">Describe a change</label>
            <textarea
              id="build-chat"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              placeholder="Describe a change…"
              className="w-full resize-none bg-transparent px-3 pt-2.5 text-sm outline-none placeholder:text-faint"
            />
            <div className="flex items-center gap-2 px-2 pb-2">
              <span className="text-xs text-faint">Questions are free. Changes show their cost first.</span>
              <button type="submit" disabled={!draft.trim()} aria-label="Send" className="ml-auto grid size-7 place-items-center rounded-md bg-accent text-accent-ink disabled:opacity-40">
                <ArrowUp className="size-4" />
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Canvas */}
      <section className={clsx("min-h-0 min-w-0 flex-1 flex-col lg:flex", pane === "preview" ? "flex" : "hidden")}>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
          <div className="flex gap-1">
            {views.map((v) => (
              <button key={v.id} onClick={() => setView(v.id)} className={clsx("rounded-md px-3 py-1.5 text-sm", activeView === v.id ? "bg-surface-2 text-ink" : "text-muted hover:text-ink")}>
                {v.label}
              </button>
            ))}
          </div>
          {activeView === "preview" && (
            <>
              <div className="ml-auto flex rounded-md border border-line p-0.5">
                {([["desktop", Monitor], ["tablet", Tablet], ["phone", Smartphone]] as const).map(([d, Icon]) => (
                  <button key={d} onClick={() => setDevice(d)} aria-label={d} className={clsx("grid size-7 place-items-center rounded", device === d ? "bg-surface-2 text-ink" : "text-muted")}>
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
              <button onClick={() => setPicking((p) => !p)} className={clsx("flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm", picking ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2")}>
                <MousePointerClick className="size-4" /> Edit visually
              </button>
            </>
          )}
          <div className={clsx("relative", activeView !== "preview" && "ml-auto")}>
            <button onClick={() => setShowHistory((h) => !h)} className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted hover:bg-surface-2">
              <History className="size-4" /> Checkpoints
            </button>
            {showHistory && (
              <div className="absolute right-0 top-10 z-30 w-72 rounded-lg border border-line bg-surface p-2 shadow-xl">
                {checkpoints.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-surface-2">
                    <Circle className={clsx("size-2.5 shrink-0", i === 0 ? "fill-accent text-accent" : "text-faint")} />
                    <div className="grid min-w-0 flex-1">
                      <span className="truncate text-sm">{c.label}</span>
                      <span className="text-xs text-faint">{c.when} · {c.by}</span>
                    </div>
                    {i > 0 && (
                      <button
                        onClick={() => {
                          setShowHistory(false);
                          setMessages((m) => [...m, { kind: "assistant", text: `Restored "${c.label}". Nothing was deleted; you can jump forward again from Checkpoints.` }]);
                        }}
                        className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted hover:text-ink"
                      >
                        <RotateCcw className="size-3" /> Restore
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {activeView === "preview" && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-surface px-3 py-1.5 text-xs text-muted" aria-label="App health">
            <span className="flex items-center gap-1.5">
              <span className={clsx("size-1.5 rounded-full", phase === "building" ? "animate-pulse bg-accent" : "bg-good")} />
              {phase === "building" ? "Building…" : "Preview up to date"}
            </span>
            <span className="flex items-center gap-1"><ShieldCheck className="size-3.5 text-good" /> 18/18 checks</span>
            <span className="flex items-center gap-1"><FlaskConical className="size-3.5 text-good" /> Evals {evalScore}/100</span>
            <span className="flex items-center gap-1"><Wallet className="size-3.5" /> $0.42 today</span>
            <span className="hidden text-faint sm:inline">Click any row to see what the agents did</span>
          </div>
        )}
        <div className="relative min-h-0 flex-1 overflow-auto bg-surface-2">
          {activeView === "preview" && openRun && phase !== "building" && <RunDetail plan={plan} id={openRun} onClose={() => setOpenRun(null)} />}
          {activeView === "preview" && (
            <div className="flex h-full justify-center p-4">
              <div className="relative h-fit w-full transition-[max-width] duration-300" style={{ maxWidth: deviceWidth[device] }}>
                <div className="flex items-center gap-2 rounded-t-md border border-b-0 border-line bg-surface px-3 py-1.5">
                  <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="size-2 rounded-full bg-line-strong" />)}</span>
                  <span className="mx-auto font-mono text-[11px] text-faint">{host}.preview.architect.new</span>
                </div>
                <div className={clsx("rounded-b-md border border-line", phase === "building" && "opacity-40 blur-[1px]")}>
                  {generic && plan ? <PlanApp plan={plan} compact={device === "phone"} highlight={picking} accent={appTheme.accent} selected={openRun ?? undefined} onOpen={setOpenRun} /> : <MockClaimsApp compact={device === "phone"} highlight={picking} accent={appTheme.id === "harbor" ? "#0f5c4d" : appTheme.accent} selected={openRun ?? undefined} onOpen={setOpenRun} />}
                </div>
                {picking && phase !== "building" && (
                  <div className="absolute left-1/2 top-1/2 z-10 grid w-64 -translate-x-1/2 gap-2 rounded-lg border border-line bg-surface p-3 text-sm shadow-xl">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-faint">Selected · {generic ? "Main table" : "Claims table"}</span>
                    {(generic ? ["Show newest first", "Add a 'Waiting on' column", "Make rows more compact"] : ["Sort by risk, highest first", "Add a 'Days open' column", "Make rows more compact"]).map((o) => (
                      <button key={o} onClick={() => { setPicking(false); send(o); }} className="rounded-md border border-line px-2.5 py-1.5 text-left text-xs hover:border-accent">
                        {o}
                      </button>
                    ))}
                  </div>
                )}
                {phase === "building" && (
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm shadow">
                      <Loader2 className="size-4 animate-spin text-accent" /> {buildSteps[Math.min(step, buildSteps.length - 1)].label}…
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeView === "code" && <CodePanel />}
          {activeView === "terminal" && <TerminalPanel />}
          {activeView === "logs" && <LogsPanel />}
        </div>
      </section>
    </div>
  );
}

function Timeline({ steps, step, pro }: { steps: BuildStep[]; step: number; pro: boolean }) {
  const done = step >= steps.length;
  return (
    <div className="grid gap-0 rounded-lg border border-line p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium">{done ? "Build complete" : "Building"}</span>
        {done && <span className="flex items-center gap-1 text-xs text-muted"><Undo2 className="size-3" /> Checkpoint saved</span>}
      </div>
      <ol className="grid gap-2">
        {steps.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          return (
            <li key={s.id} className="flex gap-2.5 text-sm">
              <span className="mt-0.5">
                {state === "done" ? <Check className="size-4 text-good" /> : state === "active" ? <Loader2 className="size-4 animate-spin text-accent" /> : <Circle className="size-4 text-line-strong" />}
              </span>
              <div className={clsx("grid gap-0.5", state === "todo" && "text-faint")}>
                <span>{s.label}</span>
                {state !== "todo" && <span className="text-xs text-muted">{s.detail}</span>}
                {pro && state !== "todo" && s.files.length > 0 && (
                  <span className="font-mono text-[11px] text-faint">{s.files.join("  ")}</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
