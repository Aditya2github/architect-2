"use client";

import { useState } from "react";
import clsx from "clsx";
import { ArrowUp, FlaskConical, Loader2, MessageSquare, Play, Settings2, Sparkles, Waypoints } from "lucide-react";
import { AgentFlow } from "@/components/agent-flow";
import { usePrefs } from "@/components/providers";
import { agents } from "@/lib/blueprint";

const frameworks = ["Lyzr Agents", "LangGraph", "CrewAI", "OpenAI Agents SDK", "Claude Agent SDK", "GitAgent"];

const personas = [
  { name: "Honest first-time claimant", runs: 240, pass: 98.8 },
  { name: "Repeat claimant, same address", runs: 180, pass: 92.2 },
  { name: "Inflated amount, real incident", runs: 160, pass: 90.6 },
  { name: "Missing documents", runs: 150, pass: 95.3 },
  { name: "Staged collision ring", runs: 120, pass: 88.3 },
  { name: "Policy lapsed last week", runs: 110, pass: 96.4 },
];

const failures = [
  { claim: "CLM-S-0412", what: "Flagged a real claim as high risk because the customer moved house 3 weeks ago.", expected: "Low risk: an address change alone is not a fraud signal." },
  { claim: "CLM-S-0977", what: "Missed a staged collision where two claims shared the same tow truck and witness.", expected: "High risk: shared third parties across claims is rule 17." },
];

const trace = [
  { name: "intake.parse_documents", ms: 820, start: 0, kind: "tool" },
  { name: "intake.llm", ms: 1240, start: 820, kind: "llm" },
  { name: "fraud.similar_claims", ms: 310, start: 2060, kind: "tool" },
  { name: "fraud.llm", ms: 2980, start: 2370, kind: "llm" },
  { name: "coverage.search_policy", ms: 420, start: 2060, kind: "tool" },
  { name: "coverage.llm", ms: 1650, start: 2480, kind: "llm" },
  { name: "router.llm", ms: 610, start: 5350, kind: "llm" },
  { name: "router.slack_post", ms: 190, start: 5960, kind: "tool" },
];

type Tab = "overview" | "test" | "evals" | "traces";

export function AgentsView() {
  const { lens } = usePrefs();
  const [selected, setSelected] = useState(agents[1].id);
  const [framework, setFramework] = useState("LangGraph");
  const [tab, setTab] = useState<Tab>("evals");
  const [simulating, setSimulating] = useState(false);
  const agent = agents.find((a) => a.id === selected) ?? agents[0];

  const tabs: { id: Tab; label: string; icon: typeof Settings2; pro?: boolean }[] = [
    { id: "overview", label: "Setup", icon: Settings2 },
    { id: "test", label: "Try it", icon: MessageSquare },
    { id: "evals", label: "Evals", icon: FlaskConical },
    { id: "traces", label: "Traces", icon: Waypoints, pro: true },
  ];
  const visible = tabs.filter((t) => !t.pro || lens === "pro");
  const active = visible.some((t) => t.id === tab) ? tab : "evals";

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
          <p className="text-sm text-muted">Four agents work on every claim. Each one is tested before it can go live.</p>
        </div>
        {lens === "pro" ? (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Framework</span>
            <select id="framework" value={framework} onChange={(e) => setFramework(e.target.value)} className="h-9 rounded-md border border-line bg-surface px-2 text-sm">
              {frameworks.map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>
        ) : (
          <span className="text-xs text-faint">Built with {framework}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Overall eval score", "94 / 100", "text-good"],
          ["Simulated claims", "1,200", ""],
          ["Cost per claim", "$0.031", ""],
          ["Slowest step (p95)", "4.6 s", ""],
        ].map(([k, v, c]) => (
          <div key={k} className="grid gap-1 rounded-lg border border-line bg-surface p-4">
            <span className="text-xs text-muted">{k}</span>
            <span className={clsx("text-xl font-semibold tabular-nums", c)}>{v}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid content-start gap-3">
          <AgentFlow selected={selected} onSelect={setSelected} />
          <p className="text-xs text-faint">Select an agent to see its setup, try it, and read its report card.</p>
        </div>

        <div className="grid min-w-0 content-start gap-4 rounded-xl border border-line bg-surface p-5">
          <div className="grid gap-1">
            <span className="text-lg font-semibold">{agent.name}</span>
            <span className="text-sm text-muted">{agent.job}</span>
          </div>

          <div className="flex gap-1 border-b border-line">
            {visible.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} className={clsx("flex items-center gap-1.5 border-b-2 px-3 pb-2 text-sm", active === id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink")}>
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>

          {active === "overview" && (
            <dl className="grid gap-3 text-sm">
              {[
                ["Model", agent.model],
                ["Tools", agent.tools.join(", ")],
                ["Knowledge", agent.knowledge ?? "None"],
                ["Acts on its own", agent.id === "router" ? "Only for low-risk claims under $5,000" : "No, suggests only"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 border-b border-line pb-3">
                  <dt className="text-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
              {lens === "pro" && (
                <pre className="overflow-x-auto rounded-md bg-surface-2 p-3 font-mono text-xs leading-5 text-muted">{`agent:
  name: ${agent.name}
  model: ${agent.model.toLowerCase().replace(/ /g, "-")}
  tools: [${agent.tools.map((t) => t.toLowerCase().replace(/ /g, "_")).join(", ")}]
  temperature: 0.2
  max_steps: 8
  guardrails: [no_pii_in_logs, cite_evidence]`}</pre>
              )}
            </dl>
          )}

          {active === "test" && (
            <div className="grid gap-3 text-sm">
              <div className="ml-10 rounded-lg bg-accent-soft px-3 py-2">Motor claim, rear collision, $1,840. Policy MTR-88213, first claim, photos and police report attached.</div>
              <div className="flex gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
                <div className="grid gap-1">
                  <span><b>Risk: low.</b> No rules matched.</span>
                  <span className="text-muted">First claim on this policy in 4 years · amount within 0.8× the average for rear collisions · police report number verified.</span>
                  <span className="font-mono text-[11px] text-faint">2.9 s · $0.018 · 3 tool calls</span>
                </div>
              </div>
              <div className="flex gap-2 rounded-lg border border-line p-2">
                <label htmlFor="agent-test" className="sr-only">Test message</label>
                <input id="agent-test" placeholder="Paste a claim to test this agent…" className="flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-faint" />
                <button aria-label="Send test" className="grid size-7 place-items-center rounded-md bg-accent text-accent-ink"><ArrowUp className="size-4" /></button>
              </div>
            </div>
          )}

          {active === "evals" && (
            <div className="grid gap-5 text-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="grid">
                  <span className="text-3xl font-semibold tabular-nums text-good">{agent.evalScore}</span>
                  <span className="text-xs text-muted">eval score</span>
                </div>
                <div className="grid text-xs text-muted">
                  <span>{agent.passRate}% of simulated claims handled correctly</span>
                  <span>{agent.avgCost} per claim · p95 {agent.p95}</span>
                </div>
                <button
                  onClick={() => {
                    setSimulating(true);
                    setTimeout(() => setSimulating(false), 2200);
                  }}
                  disabled={simulating}
                  className="ml-auto flex h-8 items-center gap-1.5 rounded-md border border-line px-3 text-sm hover:border-line-strong disabled:opacity-60"
                >
                  {simulating ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                  {simulating ? "Simulating 1,200 claims…" : "Run simulation"}
                </button>
              </div>

              <div className="grid gap-2">
                <span className="font-medium">By type of claimant</span>
                {personas.map((p) => (
                  <div key={p.name} className="grid grid-cols-[minmax(0,1fr)_120px_48px] items-center gap-3">
                    <span className="truncate text-muted">{p.name}</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-line">
                      <span className={clsx("block h-full rounded-full", p.pass >= 95 ? "bg-good" : p.pass >= 90 ? "bg-accent" : "bg-warn")} style={{ width: `${p.pass}%` }} />
                    </span>
                    <span className="text-right font-mono text-xs tabular-nums">{p.pass}%</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-2">
                <span className="font-medium">Where it went wrong</span>
                {failures.map((f) => (
                  <div key={f.claim} className="grid gap-1.5 rounded-lg border border-line p-3">
                    <span className="font-mono text-[11px] text-faint">{f.claim}</span>
                    <span>{f.what}</span>
                    <span className="text-muted">Expected: {f.expected}</span>
                    <div className="flex gap-2 pt-1">
                      <button className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-ink">Fix with Architect</button>
                      <button className="rounded-md border border-line px-2.5 py-1 text-xs">Add to test set</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "traces" && (
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="font-mono">run 7f3a91 · CLM-20930</span>
                <span className="font-mono">6.15 s · $0.034 · 11,420 tokens</span>
              </div>
              <div className="grid gap-1.5">
                {trace.map((s) => (
                  <div key={s.name} className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-3">
                    <span className="truncate font-mono text-xs text-muted">{s.name}</span>
                    <span className="relative h-5 rounded bg-surface-2">
                      <span
                        className={clsx("absolute inset-y-0 rounded", s.kind === "llm" ? "bg-accent/70" : "bg-agent/70")}
                        style={{ left: `${(s.start / 6150) * 100}%`, width: `${(s.ms / 6150) * 100}%` }}
                        title={`${s.ms} ms`}
                      />
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-accent/70" /> Model call</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-agent/70" /> Tool call</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
