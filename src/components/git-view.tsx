"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check, CircleDot, ExternalLink, GitBranch, GitMerge, GitPullRequest, Loader2, Lock, RefreshCw, Search } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { Button } from "@/components/ui";

const repos = ["acme-insurance/claims-triage", "acme-insurance/claims-portal", "acme-insurance/policy-docs", "aditya/sandbox"];

const prs = [
  { n: 14, title: "Fraud Scout explains each flag", branch: "task/fraud-explanations", checks: "All checks passed", files: 3, add: 41, del: 9, state: "open" },
  { n: 13, title: "Weekly dashboard for team leads", branch: "task/weekly-dashboard", checks: "Evals running", files: 6, add: 212, del: 14, state: "open" },
  { n: 12, title: "Slack summary for the Router", branch: "task/slack-summary", checks: "Merged", files: 2, add: 28, del: 3, state: "merged" },
];

export function GitView() {
  const { lens } = usePrefs();
  const [stage, setStage] = useState<"connect" | "pick" | "linking" | "connected">("connected");
  const [repo, setRepo] = useState(repos[0]);
  const [autoCommit, setAutoCommit] = useState(true);
  const [merged, setMerged] = useState<number[]>([]);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">GitHub</h1>
          <p className="text-sm text-muted">Your code lives in your own repository. Architect never locks it in.</p>
        </div>
        {stage === "connected" && <Button size="sm" variant="ghost" onClick={() => setStage("connect")}>Disconnect</Button>}
      </div>

      {stage === "connect" && (
        <section className="grid justify-items-start gap-3 rounded-xl border border-line bg-surface p-6">
          <span className="font-semibold">Connect GitHub</span>
          <p className="max-w-lg text-sm text-muted">Architect creates a repository (or uses one you pick) and saves every change as a commit. You can clone it, run it locally, or host it anywhere.</p>
          <Button variant="primary" onClick={() => setStage("pick")}>Continue with GitHub</Button>
        </section>
      )}

      {stage === "pick" && (
        <section className="grid gap-3 rounded-xl border border-line bg-surface p-5">
          <span className="font-semibold">Choose a repository</span>
          <div className="flex items-center gap-2 rounded-md border border-line px-3"><Search className="size-4 text-faint" /><input id="repo-search" placeholder="Search repositories" className="h-9 flex-1 bg-transparent text-sm outline-none" /></div>
          <div className="grid gap-1">
            <button onClick={() => { setRepo("aditya/claims-triage"); setStage("linking"); setTimeout(() => setStage("connected"), 1400); }} className="rounded-md border border-dashed border-accent px-3 py-2 text-left text-sm text-accent">+ Create new repository: claims-triage</button>
            {repos.map((r) => (
              <button key={r} onClick={() => { setRepo(r); setStage("linking"); setTimeout(() => setStage("connected"), 1400); }} className="flex items-center gap-2 rounded-md px-3 py-2 text-left font-mono text-sm hover:bg-surface-2">
                <Lock className="size-3.5 text-faint" /> {r}
              </button>
            ))}
          </div>
        </section>
      )}

      {stage === "linking" && (
        <section className="flex items-center gap-3 rounded-xl border border-line bg-surface p-6 text-sm">
          <Loader2 className="size-4 animate-spin text-accent" /> Pushing your code to {repo}…
        </section>
      )}

      {stage === "connected" && (
        <>
          <section className="grid gap-4 rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-good-soft text-good"><Check className="size-4" /></span>
              <div className="grid">
                <span className="font-mono text-sm font-medium">{repo}</span>
                <span className="text-xs text-muted">Last saved 12 min ago · 47 commits</span>
              </div>
              <div className="ml-auto flex gap-2">
                <Button size="sm"><RefreshCw className="size-3.5" /> Pull</Button>
                <Button size="sm">View on GitHub <ExternalLink className="size-3.5" /></Button>
              </div>
            </div>
            <label className="flex items-center justify-between gap-4 border-t border-line pt-4 text-sm">
              <span className="grid">
                <span className="font-medium">{lens === "pro" ? "Branch per task" : "Save every change automatically"}</span>
                <span className="text-muted">{lens === "pro" ? "Each chat request gets its own branch and pull request. Nothing lands on main without review." : "Every change you make here is saved to GitHub as it happens."}</span>
              </span>
              <button role="switch" aria-checked={autoCommit} onClick={() => setAutoCommit((a) => !a)} className={clsx("relative h-6 w-11 shrink-0 rounded-full transition-colors", autoCommit ? "bg-accent" : "bg-line-strong")}>
                <span className={clsx("absolute top-0.5 size-5 rounded-full bg-white transition-all", autoCommit ? "left-[22px]" : "left-0.5")} />
              </button>
            </label>
          </section>

          {lens === "pro" ? (
            <section className="grid gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Pull requests</h2>
                <span className="flex items-center gap-1.5 font-mono text-xs text-muted"><GitBranch className="size-3.5" /> main</span>
              </div>
              {prs.map((p) => {
                const isMerged = p.state === "merged" || merged.includes(p.n);
                return (
                  <div key={p.n} className="grid gap-2 rounded-lg border border-line bg-surface p-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      {isMerged ? <GitMerge className="size-4 text-[#8b5cf6]" /> : <GitPullRequest className="size-4 text-good" />}
                      <span className="font-medium">{p.title}</span>
                      <span className="font-mono text-xs text-faint">#{p.n}</span>
                      {!isMerged && (
                        <Button size="sm" variant="primary" className="ml-auto" disabled={p.checks !== "All checks passed"} onClick={() => setMerged((m) => [...m, p.n])}>
                          Merge
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="font-mono">{p.branch}</span>
                      <span>{p.files} files</span>
                      <span><span className="text-good">+{p.add}</span> <span className="text-bad">−{p.del}</span></span>
                      <span className="flex items-center gap-1">
                        {p.checks === "Evals running" ? <Loader2 className="size-3 animate-spin" /> : <CircleDot className="size-3" />}
                        {isMerged ? "Merged" : p.checks}
                      </span>
                    </div>
                  </div>
                );
              })}
            </section>
          ) : (
            <section className="grid gap-2 rounded-xl border border-line bg-surface p-5 text-sm">
              <span className="font-semibold">Recent saves</span>
              {["Added weekly dashboard", "Fraud Scout explains each flag", "Slack summary for the Router"].map((c, i) => (
                <div key={c} className="flex items-center justify-between border-t border-line pt-2 first:border-t-0 first:pt-0">
                  <span>{c}</span>
                  <span className="text-xs text-faint">{["12 min ago", "40 min ago", "1 h ago"][i]}</span>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
