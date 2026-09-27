import { agents as claimsAgents, type Agent } from "@/lib/blueprint";
import type { Autonomy, Plan } from "@/lib/plan";

// Turns a project's plan into the Agents screen's report card.
// Scores for generated plans are simulated, but stable for the same agent name.

export type ReportAgent = Agent & { autonomy: Autonomy };

export type AgentReport = {
  agents: ReportAgent[];
  unit: string;
  overall: number;
  costPerRun: number;
  personas: { name: string; pass: number }[];
  failures: { id: string; what: string; expected: string }[];
  trace: { name: string; ms: number; start: number; kind: "llm" | "tool" }[];
};

function seed(text: string) {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

const claimsReport: AgentReport = {
  agents: claimsAgents.map((a) => ({ ...a, autonomy: a.id === "router" ? "asks" : a.id === "intake" ? "acts" : "suggests" })),
  unit: "claim",
  overall: 94,
  costPerRun: 0.031,
  personas: [
    { name: "Honest first-time claimant", pass: 98.8 },
    { name: "Repeat claimant, same address", pass: 92.2 },
    { name: "Inflated amount, real incident", pass: 90.6 },
    { name: "Missing documents", pass: 95.3 },
    { name: "Staged collision ring", pass: 88.3 },
    { name: "Policy lapsed last week", pass: 96.4 },
  ],
  failures: [
    { id: "CLM-S-0412", what: "Flagged a real claim as high risk because the customer moved house 3 weeks ago.", expected: "Low risk: an address change alone is not a fraud signal." },
    { id: "CLM-S-0977", what: "Missed a staged collision where two claims shared the same tow truck and witness.", expected: "High risk: shared third parties across claims is rule 17." },
  ],
  trace: [
    { name: "intake.parse_documents", ms: 820, start: 0, kind: "tool" },
    { name: "intake.llm", ms: 1240, start: 820, kind: "llm" },
    { name: "fraud.similar_claims", ms: 310, start: 2060, kind: "tool" },
    { name: "fraud.llm", ms: 2980, start: 2370, kind: "llm" },
    { name: "coverage.search_policy", ms: 420, start: 2060, kind: "tool" },
    { name: "coverage.llm", ms: 1650, start: 2480, kind: "llm" },
    { name: "router.llm", ms: 610, start: 5350, kind: "llm" },
    { name: "router.slack_post", ms: 190, start: 5960, kind: "tool" },
  ],
};

const costByModel: Record<string, number> = { "Claude Opus 5": 0.018, "Claude Sonnet 5": 0.007, "Claude Haiku 4.5": 0.001 };

export function buildReport(plan: Plan | null): AgentReport {
  if (!plan || plan.source === "blueprint") return claimsReport;

  const unit = plan.data[0]?.replace(/s$/, "").replace(/_/g, " ") || "request";
  const agents: ReportAgent[] = plan.agents.map((a) => {
    const r = seed(a.name + plan.title);
    const passRate = Math.round((89 + r * 9) * 10) / 10;
    return {
      id: slug(a.name) || "agent",
      name: a.name,
      job: a.job,
      model: a.model,
      tools: a.tools,
      autonomy: a.autonomy,
      evalScore: Math.round(passRate - 1 - r * 2),
      passRate,
      avgCost: `$${(costByModel[a.model] ?? 0.007).toFixed(3)}`,
      p95: `${(0.8 + r * 3.8).toFixed(1)}s`,
    };
  });

  let t = 0;
  const trace: AgentReport["trace"] = [];
  agents.forEach((a) => {
    const r = seed(a.id);
    if (a.tools[0]) {
      const ms = Math.round(200 + r * 700);
      trace.push({ name: `${a.id}.${slug(a.tools[0])}`, ms, start: t, kind: "tool" });
      t += ms;
    }
    const ms = Math.round(600 + r * 2200);
    trace.push({ name: `${a.id}.llm`, ms, start: t, kind: "llm" });
    t += ms;
  });

  const [first, second] = agents;
  return {
    agents,
    unit,
    overall: Math.round(agents.reduce((s, a) => s + a.evalScore, 0) / agents.length),
    costPerRun: plan.estimate.costPerRun,
    personas: [
      { name: `A typical ${unit}`, pass: 98.1 },
      { name: "Missing or unclear details", pass: 93.4 },
      { name: "Urgent or upset sender", pass: 91.7 },
      { name: "Duplicate submission", pass: 95.9 },
      { name: "Outside the rules you set", pass: 89.2 },
      { name: "Unusual edge case", pass: 90.5 },
    ],
    failures: [
      { id: "SIM-0213", what: `${first.name} skipped an attachment that held the key detail, so later agents worked from incomplete information.`, expected: "Read every attachment before passing the work on." },
      { id: "SIM-0788", what: `${(second ?? first).name} acted on a request that should have waited for a person.`, expected: "Anything outside the rules you set waits for approval." },
    ],
    trace,
  };
}
