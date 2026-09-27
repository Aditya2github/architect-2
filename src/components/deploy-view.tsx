"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowUpRight, Check, Circle, Copy, Globe, Loader2, Lock, Rocket, RotateCcw, ShieldCheck } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { Button } from "@/components/ui";

const checks = [
  { label: "Browser tests", pass: "18 of 18 passed" },
  { label: "Security scan", pass: "No issues · added rate limiting to /api/claims" },
  { label: "Secrets", pass: "3 secrets stored in the vault, none in code" },
  { label: "Agent evals", pass: "94/100, above your minimum of 85" },
  { label: "Spending cap", pass: "$150 a month, alert at 80%" },
];

const envs = [
  { name: "Preview", version: "c7 · Added weekly dashboard", commit: "a41f9e2", url: "claims-triage.preview.architect.new", status: "Current" },
  { name: "Staging", version: "c6 · Fraud Scout explains each flag", commit: "9be07c1", url: "claims-triage.staging.architect.new", status: "Tested" },
  { name: "Production", version: "c5 · Slack summary for the Router", commit: "5d2a8f0", url: "claims-triage.architect.new", status: "Live" },
];

const history = [
  ["c5", "Production", "Aditya", "Yesterday 18:02", "Approved by Priya"],
  ["c4", "Production", "Aditya", "Mon 11:40", "Approved by Priya"],
  ["c4", "Staging", "Architect", "Mon 11:12", "Auto"],
];

export function DeployView() {
  const { lens } = usePrefs();
  const [phase, setPhase] = useState<"idle" | "checking" | "live">("idle");
  const [done, setDone] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (phase !== "checking") return;
    if (done >= checks.length) {
      const t = setTimeout(() => setPhase("live"), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 650);
    return () => clearTimeout(t);
  }, [phase, done]);

  const url = "claims-triage.architect.new";

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 md:px-8">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Deploy</h1>
        <p className="text-sm text-muted">Your app goes live only after every check below passes.</p>
      </div>

      <section className="grid gap-5 rounded-xl border border-line bg-surface p-5 md:p-6">
        {phase === "live" ? (
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-good-soft text-good"><Check className="size-5" /></span>
              <div className="grid">
                <span className="text-lg font-semibold">Your app is live</span>
                <span className="text-sm text-muted">Anyone with the link and a company account can sign in.</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-bg p-2 pl-3">
              <Globe className="size-4 text-faint" />
              <span className="font-mono text-sm">{url}</span>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(`https://${url}`).catch(() => {});
                    setCopied(true);
                  }}
                >
                  <Copy className="size-3.5" /> {copied ? "Copied" : "Copy link"}
                </Button>
                <Button size="sm" variant="primary">Open app <ArrowUpRight className="size-3.5" /></Button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                <span className="text-muted">Custom domain</span>
                <input id="custom-domain" placeholder="claims.yourcompany.com" className="h-9 rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-accent" />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="text-muted">Who can open it</span>
                <select id="access" className="h-9 rounded-md border border-line bg-bg px-2 text-sm">
                  <option>People at my company</option>
                  <option>Anyone with the link</option>
                  <option>Only invited people</option>
                </select>
              </label>
            </div>
            <label className="flex items-start justify-between gap-4 rounded-lg border border-line p-3 text-sm">
              <span className="grid gap-0.5">
                <span className="font-medium">Publish as a blueprint</span>
                <span className="text-muted">Other teams can start from your app. They get the agents, evals and sample data, never your data or keys.</span>
              </span>
              <input id="publish-blueprint" type="checkbox" className="mt-1 size-4 accent-[var(--accent)]" />
            </label>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid">
                <span className="font-semibold">Pre-flight checks</span>
                <span className="text-sm text-muted">Checkpoint c7 · Added weekly dashboard</span>
              </div>
              <Button variant="primary" onClick={() => { setDone(0); setPhase("checking"); }} disabled={phase === "checking"}>
                {phase === "checking" ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
                {phase === "checking" ? "Running checks…" : "Run checks & go live"}
              </Button>
            </div>
            <ol className="grid gap-2">
              {checks.map((c, i) => {
                const state = phase === "idle" ? "todo" : i < done ? "done" : i === done ? "active" : "todo";
                return (
                  <li key={c.label} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-sm">
                    {state === "done" ? <Check className="size-4 text-good" /> : state === "active" ? <Loader2 className="size-4 animate-spin text-accent" /> : <Circle className="size-4 text-line-strong" />}
                    <span className="font-medium">{c.label}</span>
                    <span className={clsx("ml-auto text-right text-muted", state !== "done" && "opacity-0")}>{c.pass}</span>
                  </li>
                );
              })}
            </ol>
            <p className="flex items-center gap-2 text-xs text-faint"><ShieldCheck className="size-3.5" /> If any check fails, nothing goes live and Architect explains how to fix it.</p>
          </>
        )}
      </section>

      {lens === "pro" && (
        <>
          <section className="grid gap-3">
            <h2 className="font-semibold">Environments</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {envs.map((e, i) => (
                <div key={e.name} className="grid content-start gap-2 rounded-lg border border-line bg-surface p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{e.name}</span>
                    <span className={clsx("rounded-full px-2 py-0.5 text-xs", e.status === "Live" ? "bg-good-soft text-good" : "bg-surface-2 text-muted")}>{e.status}</span>
                  </div>
                  <span className="text-muted">{e.version}</span>
                  <span className="font-mono text-xs text-faint">{e.commit} · {e.url}</span>
                  <div className="flex gap-2 pt-1">
                    {i < 2 && <Button size="sm">Promote to {envs[i + 1].name}</Button>}
                    {i === 2 && <Button size="sm"><RotateCcw className="size-3.5" /> Roll back</Button>}
                  </div>
                </div>
              ))}
            </div>
            <p className="flex items-center gap-2 text-xs text-faint"><Lock className="size-3.5" /> Production deploys need approval from an admin. Agents can never write to production data from preview.</p>
          </section>

          <section className="grid gap-3">
            <h2 className="font-semibold">History</h2>
            <div className="overflow-x-auto rounded-lg border border-line bg-surface">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="text-xs text-muted"><tr>{["Checkpoint", "Environment", "By", "When", "Approval"].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {history.map((r, i) => (
                    <tr key={i} className="border-t border-line">{r.map((c, j) => <td key={j} className={clsx("px-4 py-2", j === 0 && "font-mono")}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
