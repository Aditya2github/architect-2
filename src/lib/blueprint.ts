// The demo app's full "blueprint": plan, agents, build steps, files and runtime data.
// Every project screen renders from this so the story is consistent end to end.

export type Agent = {
  id: string;
  name: string;
  job: string;
  model: string;
  tools: string[];
  knowledge?: string;
  evalScore: number;
  passRate: number;
  avgCost: string;
  p95: string;
};

export const agents: Agent[] = [
  {
    id: "intake",
    name: "Intake Reader",
    job: "Reads each new claim from email or upload and pulls out the policy number, incident, amount and documents.",
    model: "Claude Sonnet 5",
    tools: ["Gmail", "Document OCR"],
    evalScore: 97,
    passRate: 98.4,
    avgCost: "$0.004",
    p95: "2.1s",
  },
  {
    id: "fraud",
    name: "Fraud Scout",
    job: "Checks the claim against past claims and 42 fraud rules, and explains every flag it raises.",
    model: "Claude Opus 5.5",
    tools: ["Claims database", "Web search"],
    knowledge: "Fraud rules playbook.pdf",
    evalScore: 91,
    passRate: 93.1,
    avgCost: "$0.019",
    p95: "4.6s",
  },
  {
    id: "coverage",
    name: "Coverage Checker",
    job: "Reads the customer's policy and says whether the incident is covered, quoting the clause.",
    model: "Claude Sonnet 5",
    tools: ["Policy library"],
    knowledge: "Policy wordings (312 files)",
    evalScore: 94,
    passRate: 95.7,
    avgCost: "$0.007",
    p95: "2.8s",
  },
  {
    id: "router",
    name: "Router",
    job: "Assigns the claim to the right adjuster by type, value and workload, then posts a summary in Slack.",
    model: "Claude Haiku 4.5",
    tools: ["Slack", "Adjuster roster"],
    evalScore: 96,
    passRate: 97.9,
    avgCost: "$0.001",
    p95: "0.9s",
  },
];

export const scopingQuestions = [
  { q: "Where do new claims arrive?", options: ["Shared inbox", "Upload portal", "Both"], answer: "Both" },
  { q: "Who reviews the flagged claims?", options: ["Any adjuster", "Special investigations team", "Team lead"], answer: "Special investigations team" },
  { q: "Should agents act on their own?", options: ["Suggest only", "Act, then notify", "Act on low-risk only"], answer: "Act on low-risk only" },
];

export const planSummary = {
  title: "Claims Triage Copilot",
  forWho: "Claims operations team at a mid-size insurer (12 adjusters, ~400 claims a week).",
  problem: "Adjusters spend about 40% of their week sorting claims, and fraud is caught late.",
  outcome: "Every claim is read, checked for coverage and fraud, and routed within 5 minutes of arriving. Suspicious ones go to investigations with the reasons written out.",
  stories: [
    "As an adjuster, I open my queue and see only claims assigned to me, with a one-line summary.",
    "As an investigator, I see why a claim was flagged, with links to the evidence.",
    "As a team lead, I see volume, risk mix and time-to-route for the week.",
  ],
  screens: ["Claims queue", "Claim detail with agent notes", "Investigations board", "Weekly dashboard"],
};

export const estimate = {
  buildCost: "$2.80",
  buildTime: "~9 min",
  perRun: "$0.031",
  monthly: "~$50 at 400 claims a week",
};

export type BuildStep = { id: string; label: string; detail: string; files: string[]; seconds: number };

export const buildSteps: BuildStep[] = [
  { id: "scaffold", label: "Setting up the project", detail: "Next.js app, database tables and sign-in", files: ["package.json", "src/app/layout.tsx", "db/schema.sql"], seconds: 2 },
  { id: "agents", label: "Creating 4 agents", detail: "Intake Reader, Fraud Scout, Coverage Checker, Router", files: ["agents/intake.py", "agents/fraud.py", "agents/coverage.py", "agents/router.py", "agents/graph.py"], seconds: 3 },
  { id: "ui", label: "Building the screens", detail: "Claims queue, claim detail, investigations board, dashboard", files: ["src/app/claims/page.tsx", "src/app/claims/[id]/page.tsx", "src/components/risk-badge.tsx"], seconds: 3 },
  { id: "wire", label: "Connecting agents to the screens", detail: "Queue updates live as agents finish", files: ["src/app/api/claims/route.ts", "src/lib/agents.ts"], seconds: 2 },
  { id: "test", label: "Testing in a real browser", detail: "18 checks, 1,200 simulated claims", files: ["tests/claims.spec.ts", "evals/fraud.yaml"], seconds: 3 },
  { id: "verify", label: "Verified", detail: "No console errors, all screens load, evals 94/100", files: [], seconds: 1 },
];

export type Claim = {
  id: string;
  customer: string;
  type: string;
  amount: number;
  risk: "low" | "medium" | "high";
  coverage: "Covered" | "Partial" | "Check";
  assignee: string;
  received: string;
};

export const claims: Claim[] = [
  { id: "CLM-20931", customer: "Priya Nair", type: "Motor · rear collision", amount: 1840, risk: "low", coverage: "Covered", assignee: "R. Iyer", received: "4 min ago" },
  { id: "CLM-20930", customer: "Daniel Ortiz", type: "Home · water damage", amount: 12400, risk: "high", coverage: "Check", assignee: "Investigations", received: "11 min ago" },
  { id: "CLM-20929", customer: "Mei Tanaka", type: "Travel · lost baggage", amount: 620, risk: "low", coverage: "Covered", assignee: "S. Kapoor", received: "18 min ago" },
  { id: "CLM-20928", customer: "Ahmed Hassan", type: "Motor · theft", amount: 23900, risk: "medium", coverage: "Partial", assignee: "R. Iyer", received: "26 min ago" },
  { id: "CLM-20927", customer: "Laura Becker", type: "Health · outpatient", amount: 310, risk: "low", coverage: "Covered", assignee: "A. Mehta", received: "39 min ago" },
  { id: "CLM-20926", customer: "Tom Walsh", type: "Home · fire", amount: 48200, risk: "high", coverage: "Check", assignee: "Investigations", received: "1 h ago" },
];

export const files: { path: string; lang: string; code: string }[] = [
  {
    path: "agents/fraud.py",
    lang: "python",
    code: `from langgraph.graph import StateGraph
from architect import Agent, tool, knowledge

rules = knowledge("fraud-rules-playbook.pdf")

@tool
def similar_claims(policy_id: str, days: int = 365):
    """Past claims on the same policy or address."""
    return db.query("claims", policy_id=policy_id, since_days=days)

fraud_scout = Agent(
    name="Fraud Scout",
    model="claude-opus-5-5",
    tools=[similar_claims, web_search],
    knowledge=[rules],
    instructions="""
    Check the claim against the fraud rules and past claims.
    Return a risk level (low, medium, high) and one line per
    reason, each with a link to the evidence.
    Never accuse the customer; describe the signal.
    """,
    output=RiskAssessment,
)`,
  },
  {
    path: "agents/graph.py",
    lang: "python",
    code: `from langgraph.graph import StateGraph, END
from .intake import intake_reader
from .fraud import fraud_scout
from .coverage import coverage_checker
from .router import router

graph = StateGraph(ClaimState)
graph.add_node("intake", intake_reader)
graph.add_node("fraud", fraud_scout)
graph.add_node("coverage", coverage_checker)
graph.add_node("route", router)

graph.set_entry_point("intake")
graph.add_edge("intake", "fraud")
graph.add_edge("intake", "coverage")
graph.add_edge(["fraud", "coverage"], "route")
graph.add_edge("route", END)

app = graph.compile()`,
  },
  {
    path: "src/app/claims/page.tsx",
    lang: "tsx",
    code: `import { getClaims } from "@/lib/claims";
import { ClaimsTable } from "@/components/claims-table";

export default async function ClaimsPage() {
  const claims = await getClaims({ assignedTo: "me" });
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">My queue</h1>
      <ClaimsTable claims={claims} live />
    </main>
  );
}`,
  },
  {
    path: "db/schema.sql",
    lang: "sql",
    code: `create table claims (
  id           text primary key,
  policy_id    text not null,
  customer     text not null,
  type         text not null,
  amount       numeric(12,2),
  risk         text check (risk in ('low','medium','high')),
  coverage     text,
  assignee     text,
  received_at  timestamptz default now()
);

alter table claims enable row level security;
create policy "adjusters see their claims" on claims
  for select using (assignee = auth.jwt() ->> 'name');`,
  },
];

export const fileTree = [
  "agents/",
  "  intake.py",
  "  fraud.py",
  "  coverage.py",
  "  router.py",
  "  graph.py",
  "db/",
  "  schema.sql",
  "evals/",
  "  fraud.yaml",
  "src/app/",
  "  claims/page.tsx",
  "  claims/[id]/page.tsx",
  "  api/claims/route.ts",
  "tests/",
  "  claims.spec.ts",
  "package.json",
];

export const checkpoints = [
  { id: "c7", label: "Added weekly dashboard", when: "12 min ago", by: "You" },
  { id: "c6", label: "Fraud Scout explains each flag", when: "40 min ago", by: "You" },
  { id: "c5", label: "Slack summary for the Router", when: "1 h ago", by: "Priya" },
  { id: "c4", label: "First build from plan", when: "2 h ago", by: "Architect" },
];
