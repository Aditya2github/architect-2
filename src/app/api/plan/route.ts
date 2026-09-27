import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { estimateFor, isPlanShape, templatePlan, type Plan, type PlanAnswers } from "@/lib/plan";

export const maxDuration = 60;

const SYSTEM = `You are the planning step of Architect, a platform that builds agentic apps from a plain-language idea.
Turn the user's idea into a build plan that a non-technical person can read and sign off on.

Rules:
- 2 to 5 agents. Each agent has one clear job, written as one plain sentence a manager would understand.
- Pick tools only from what the idea needs (for example Gmail, Slack, Google Sheets, Google Calendar, HubSpot, Zendesk, Web search, Document reader, or a named internal database).
- autonomy: "suggests" (drafts for a person), "asks" (acts after approval), or "acts" (acts, then reports). Respect how much independence the user asked for; anything touching money, customers or irreversible actions should not be "acts".
- model: "Claude Opus 5" for judgement-heavy work, "Claude Sonnet 5" for most work, "Claude Haiku 4.5" for simple routing.
- 3 user stories, 3 to 5 screens, 3 risks each with a concrete safeguard, and the main data tables in snake_case.
- title: a short product name (2 to 4 words). summary: one sentence.
- Write plainly. No marketing language.`;

const agentSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    job: { type: "string" },
    tools: { type: "array", items: { type: "string" } },
    autonomy: { type: "string", enum: ["suggests", "asks", "acts"] },
    model: { type: "string", enum: ["Claude Opus 5", "Claude Sonnet 5", "Claude Haiku 4.5"] },
  },
  required: ["name", "job", "tools", "autonomy", "model"],
  additionalProperties: false,
};

const planSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    forWho: { type: "string" },
    problem: { type: "string" },
    outcome: { type: "string" },
    stories: { type: "array", items: { type: "string" } },
    screens: { type: "array", items: { type: "string" } },
    agents: { type: "array", items: agentSchema },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: { risk: { type: "string" }, safeguard: { type: "string" } },
        required: ["risk", "safeguard"],
        additionalProperties: false,
      },
    },
    data: { type: "array", items: { type: "string" } },
  },
  required: ["title", "summary", "forWho", "problem", "outcome", "stories", "screens", "agents", "risks", "data"],
  additionalProperties: false,
};

function readInput(body: unknown): { prompt: string; answers: PlanAnswers } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const a = (b.answers ?? {}) as Record<string, unknown>;
  const prompt = typeof b.prompt === "string" ? b.prompt.trim().slice(0, 2000) : "";
  if (prompt.length < 3) return null;
  const s = (v: unknown, d: string) => (typeof v === "string" && v.length <= 80 ? v : d);
  return { prompt, answers: { users: s(a.users, "My team"), autonomy: s(a.autonomy, "Act on low-risk only"), intake: s(a.intake, "Email or chat") } };
}

async function claudePlan(prompt: string, answers: PlanAnswers): Promise<Plan | null> {
  const client = new Anthropic();
  // `fallbacks` re-runs a declined request on a suitable model server-side; the SDK types don't list it yet.
  const params = {
    model: "claude-opus-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: { type: "json_schema", schema: planSchema } },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Idea: ${prompt}\n\nWho uses it: ${answers.users}\nHow independent the agents should be: ${answers.autonomy}\nWhere work comes in: ${answers.intake}`,
      },
    ],
  } as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming;

  const response = await client.beta.messages.create(params);
  if (response.stop_reason !== "end_turn") return null;
  const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text;
  if (!text) return null;
  const parsed: unknown = JSON.parse(text);
  if (!isPlanShape(parsed)) return null;
  const agents = parsed.agents.slice(0, 5);
  return { ...parsed, agents, estimate: estimateFor(agents, parsed.screens), source: "claude" };
}

export async function POST(request: Request) {
  const input = readInput(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error: "Describe your idea in a few words first." }, { status: 400 });

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const plan = await claudePlan(input.prompt, input.answers);
      if (plan) return NextResponse.json({ plan });
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) console.error("[plan] rate limited");
      else if (error instanceof Anthropic.APIError) console.error(`[plan] API error ${error.status}: ${error.message}`);
      else console.error("[plan] failed:", error);
    }
  }
  // No key, or Claude couldn't produce a valid plan: fall back to the template planner.
  return NextResponse.json({ plan: templatePlan(input.prompt, input.answers) });
}
