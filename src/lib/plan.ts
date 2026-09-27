// The build plan ("contract") a user signs before anything is built.
// Shared by the API route, the plan screen, and the build/agents screens.

export type Autonomy = "suggests" | "asks" | "acts";

export type PlanAgent = {
  name: string;
  job: string;
  tools: string[];
  autonomy: Autonomy;
  model: "Claude Opus 5" | "Claude Sonnet 5" | "Claude Haiku 4.5";
};

export type Plan = {
  title: string;
  summary: string;
  forWho: string;
  problem: string;
  outcome: string;
  stories: string[];
  screens: string[];
  agents: PlanAgent[];
  risks: { risk: string; safeguard: string }[];
  data: string[];
  estimate: { buildCost: number; buildMinutes: number; costPerRun: number };
  source: "claude" | "template" | "blueprint";
};

export type PlanAnswers = { users: string; autonomy: string; intake: string };

export const scopingQuestions: { key: keyof PlanAnswers; q: string; options: string[] }[] = [
  { key: "users", q: "Who will use it day to day?", options: ["Just me", "My team", "Our customers"] },
  { key: "autonomy", q: "How much should agents do on their own?", options: ["Suggest only", "Act on low-risk only", "Act, then tell me"] },
  { key: "intake", q: "Where does the work come in?", options: ["Email or chat", "Files and uploads", "Another app (CRM, helpdesk)"] },
];

const modelCost: Record<PlanAgent["model"], number> = {
  "Claude Opus 5": 0.018,
  "Claude Sonnet 5": 0.007,
  "Claude Haiku 4.5": 0.001,
};

/** Estimates are computed, not guessed by the model, so they stay consistent. */
export function estimateFor(agents: PlanAgent[], screens: string[]) {
  const costPerRun = agents.reduce((sum, a) => sum + modelCost[a.model], 0);
  return {
    buildCost: Math.round((1.2 + agents.length * 0.35 + screens.length * 0.15) * 100) / 100,
    buildMinutes: 4 + agents.length * 1.5 + screens.length,
    costPerRun: Math.round(costPerRun * 1000) / 1000,
  };
}

export function titleFromPrompt(prompt: string) {
  const words = prompt
    .replace(/^(an?|the|build|create|make|i want|i need)\s+/i, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5);
  const title = words.join(" ");
  return title ? title[0].toUpperCase() + title.slice(1) : "Untitled project";
}

// ---------- Template planner (used when no API key is configured) ----------

const nouns = ["claim", "ticket", "invoice", "lead", "resume", "contract", "order", "application", "email", "report", "appointment", "document", "review", "request"];

function mainNoun(text: string) {
  return nouns.find((n) => text.includes(n)) ?? "request";
}

function detectTools(text: string) {
  const tools: string[] = [];
  const add = (cond: boolean, t: string) => cond && !tools.includes(t) && tools.push(t);
  add(/gmail|email|inbox|outlook/.test(text), "Gmail");
  add(/slack/.test(text), "Slack");
  add(/teams/.test(text), "Microsoft Teams");
  add(/sheet|spreadsheet|excel/.test(text), "Google Sheets");
  add(/calendar|appointment|meeting|book/.test(text), "Google Calendar");
  add(/crm|salesforce|hubspot|lead/.test(text), "HubSpot");
  add(/zendesk|helpdesk|ticket|support/.test(text), "Zendesk");
  add(/research|web|competitor|news|market/.test(text), "Web search");
  add(/pdf|document|upload|file|invoice|resume|contract|claim/.test(text), "Document reader");
  return tools;
}

export function templatePlan(prompt: string, answers: PlanAnswers): Plan {
  const text = prompt.toLowerCase();
  const noun = mainNoun(text);
  const tools = detectTools(text);
  const pick = (...names: string[]) => tools.filter((t) => names.includes(t));
  const autonomy: Autonomy = answers.autonomy.startsWith("Suggest") ? "suggests" : answers.autonomy.startsWith("Act,") ? "acts" : "asks";

  const agents: PlanAgent[] = [];
  agents.push({ name: "Intake Reader", job: `Reads each new ${noun} as it arrives and pulls out the details the other agents need.`, tools: pick("Gmail", "Document reader", "Zendesk", "HubSpot"), autonomy: "acts", model: "Claude Sonnet 5" });
  if (/research|web|competitor|lead|news|market|find|watch/.test(text))
    agents.push({ name: "Researcher", job: `Looks up the context around each ${noun} on the web and in your connected tools, and cites every source.`, tools: pick("Web search", "HubSpot"), autonomy: "acts", model: "Claude Sonnet 5" });
  if (/score|flag|risk|fraud|analy|compare|check|match|screen|mismatch|suspicious|review/.test(text))
    agents.push({ name: "Analyst", job: `Checks each ${noun} against your rules, scores it, and explains every flag it raises.`, tools: pick("Google Sheets"), autonomy: "suggests", model: "Claude Opus 5" });
  if (/draft|write|reply|respond|post|summar|report|brief|email/.test(text))
    agents.push({ name: "Writer", job: `Drafts the reply or summary for each ${noun} in your team's tone.`, tools: pick("Gmail"), autonomy, model: "Claude Sonnet 5" });
  if (/route|assign|notify|slack|alert|book|schedule|send|teams/.test(text) || agents.length < 3)
    agents.push({ name: "Router", job: `Sends each ${noun} to the right person or next step and posts an update where your team works.`, tools: pick("Slack", "Microsoft Teams", "Google Calendar"), autonomy, model: "Claude Haiku 4.5" });

  const screens = ["Inbox of new " + noun + "s", `${noun[0].toUpperCase() + noun.slice(1)} detail with agent notes`, "Review queue", "Weekly dashboard"];
  const who = answers.users === "Just me" ? "you" : answers.users === "Our customers" ? "your customers" : "your team";

  const has = (n: string) => agents.some((x) => x.name === n);
  const suffix = has("Writer") ? "Reply Desk" : has("Analyst") ? "Review Desk" : has("Researcher") ? "Research Desk" : "Copilot";

  return {
    title: `${noun[0].toUpperCase() + noun.slice(1)} ${suffix}`,
    summary: prompt.trim().slice(0, 200),
    forWho: `Built for ${who}. Work comes in through ${answers.intake.toLowerCase()}.`,
    problem: `Every ${noun} is handled by hand today, so it is slow, inconsistent, and easy to miss.`,
    outcome: `Each new ${noun} is read, checked and routed within minutes, with the reasoning written down. People only step in where it matters.`,
    stories: [
      `As ${who === "you" ? "the owner" : "a team member"}, I see every new ${noun} with a one-line summary and what the agents already did.`,
      `As a reviewer, I see why an agent made each decision, with links to the evidence.`,
      `As a lead, I see volume, time saved and anything that needs attention this week.`,
    ],
    screens,
    agents,
    risks: [
      { risk: `An agent misreads a ${noun} and acts on it`, safeguard: autonomy === "acts" ? "Every action is logged and can be undone for 24 hours" : "Agents only suggest; a person approves each action" },
      { risk: "Private data ends up in the wrong place", safeguard: "Each user only sees their own rows; secrets stay in the vault" },
      { risk: "Costs creep up as volume grows", safeguard: "A monthly spending cap pauses runs instead of overspending" },
    ],
    data: [`${noun}s`, "agent_runs", "people", "settings"],
    estimate: estimateFor(agents, screens),
    source: "template",
  };
}

/** The seeded demo project's plan, in the same shape. */
export const claimsPlan: Plan = {
  title: "Claims Triage Copilot",
  summary: "Reads new insurance claims, flags fraud signals and routes each claim to the right adjuster.",
  forWho: "Claims operations at a mid-size insurer: 12 adjusters, about 400 claims a week.",
  problem: "Adjusters spend about 40% of their week sorting claims, and fraud is caught late.",
  outcome: "Every claim is read, checked for coverage and fraud, and routed within 5 minutes. Suspicious ones go to investigations with the reasons written out.",
  stories: [
    "As an adjuster, I open my queue and see only claims assigned to me, with a one-line summary.",
    "As an investigator, I see why a claim was flagged, with links to the evidence.",
    "As a team lead, I see volume, risk mix and time-to-route for the week.",
  ],
  screens: ["Claims queue", "Claim detail with agent notes", "Investigations board", "Weekly dashboard"],
  agents: [
    { name: "Intake Reader", job: "Reads each new claim from email or upload and pulls out the policy, incident, amount and documents.", tools: ["Gmail", "Document reader"], autonomy: "acts", model: "Claude Sonnet 5" },
    { name: "Fraud Scout", job: "Checks the claim against past claims and 42 fraud rules, and explains every flag.", tools: ["Claims database", "Web search"], autonomy: "suggests", model: "Claude Opus 5" },
    { name: "Coverage Checker", job: "Reads the customer's policy and says whether the incident is covered, quoting the clause.", tools: ["Policy library"], autonomy: "suggests", model: "Claude Sonnet 5" },
    { name: "Router", job: "Assigns the claim to the right adjuster and posts a summary in Slack.", tools: ["Slack", "Adjuster roster"], autonomy: "asks", model: "Claude Haiku 4.5" },
  ],
  risks: [
    { risk: "A real claim is wrongly flagged as fraud", safeguard: "Fraud Scout only suggests; investigators decide. Tested on 1,200 simulated claims" },
    { risk: "Customer data leaks between adjusters", safeguard: "Row-level security: adjusters see only their own claims" },
    { risk: "An agent routes a large claim without review", safeguard: "Claims over $5,000 always wait for a person" },
  ],
  data: ["claims", "claim_flags", "adjusters", "agent_runs"],
  estimate: { buildCost: 2.8, buildMinutes: 9, costPerRun: 0.031 },
  source: "blueprint",
};

/** Accepts only a well-formed plan from the model; anything else is rejected. */
export function isPlanShape(v: unknown): v is Omit<Plan, "estimate" | "source"> {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  const str = (k: string) => typeof p[k] === "string" && (p[k] as string).length > 0;
  const strArr = (k: string) => Array.isArray(p[k]) && (p[k] as unknown[]).every((x) => typeof x === "string");
  return (
    ["title", "summary", "forWho", "problem", "outcome"].every(str) &&
    ["stories", "screens", "data"].every(strArr) &&
    Array.isArray(p.agents) && p.agents.length > 0 && p.agents.length <= 6 &&
    (p.agents as Record<string, unknown>[]).every((a) => typeof a.name === "string" && typeof a.job === "string" && Array.isArray(a.tools) && typeof a.autonomy === "string" && typeof a.model === "string") &&
    Array.isArray(p.risks)
  );
}
