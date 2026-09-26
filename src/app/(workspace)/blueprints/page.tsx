import Link from "next/link";
import { Bot, FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/ui";

const industries = ["All", "Insurance", "Banking", "Retail", "Healthcare", "HR", "Sales", "Support"];

const blueprints = [
  { name: "Claims triage", industry: "Insurance", body: "Reads claims, checks coverage and fraud, routes to adjusters.", agents: 4, evalScore: 94, cost: "$0.03 / claim", prompt: "An agent that reads new insurance claims, flags the suspicious ones and routes each to the right adjuster" },
  { name: "KYC document check", industry: "Banking", body: "Verifies ID documents and proof of address, flags mismatches for review.", agents: 3, evalScore: 92, cost: "$0.02 / customer", prompt: "Check KYC documents for new bank customers and flag mismatches" },
  { name: "Support reply drafter", industry: "Support", body: "Drafts replies to tickets in your tone, cites your help center, escalates angry customers.", agents: 2, evalScore: 90, cost: "$0.01 / ticket", prompt: "Draft replies to support tickets in our tone using our help center" },
  { name: "Inbound lead researcher", industry: "Sales", body: "Researches each new lead and writes a personalised first email.", agents: 3, evalScore: 89, cost: "$0.05 / lead", prompt: "Research inbound leads and draft a personalised first email for each" },
  { name: "Resume screener", industry: "HR", body: "Scores applicants against a job description and explains every score.", agents: 2, evalScore: 88, cost: "$0.02 / resume", prompt: "Score resumes against a job description and explain each score" },
  { name: "Price-match watcher", industry: "Retail", body: "Tracks competitor prices daily and suggests changes within your margin rules.", agents: 3, evalScore: 91, cost: "$0.40 / day", prompt: "Track competitor prices daily and suggest price changes within margin rules" },
];

export default function BlueprintsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Blueprints" description="Proven agent apps to start from. Each one comes with its agents, evals and sample data, drawn from 1,000+ production deployments." />
      <div className="flex flex-wrap gap-2">
        {industries.map((i, n) => (
          <span key={i} className={n === 0 ? "rounded-full bg-ink px-3 py-1 text-sm text-bg" : "rounded-full border border-line bg-surface px-3 py-1 text-sm text-muted"}>{i}</span>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {blueprints.map((b) => (
          <div key={b.name} className="grid content-start gap-3 rounded-lg border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-faint">{b.industry}</span>
              <span className="flex items-center gap-1 text-xs text-good"><FlaskConical className="size-3.5" /> {b.evalScore}</span>
            </div>
            <span className="font-semibold">{b.name}</span>
            <p className="text-sm text-muted">{b.body}</p>
            <div className="flex items-center gap-3 text-xs text-faint">
              <span className="flex items-center gap-1"><Bot className="size-3.5" /> {b.agents} agents</span>
              <span>{b.cost}</span>
            </div>
            <Link href={`/p/new/plan?prompt=${encodeURIComponent(b.prompt)}`} className="inline-flex h-8 items-center justify-center rounded-md border border-line text-sm hover:border-accent hover:text-accent">
              Use this blueprint
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
