// Seed data for the demo workspace. Every dummy screen reads from here so
// the story stays consistent across the app.

export type ProjectStatus = "live" | "building" | "draft";

export type Project = {
  id: string;
  name: string;
  summary: string;
  status: ProjectStatus;
  agents: number;
  updated: string;
  framework: string;
  url?: string;
  evalScore?: number;
};

export const user = {
  name: "Aditya",
  email: "aditya@example.com",
  workspace: "Aditya's workspace",
  credits: 31.4,
  creditCap: 40,
};

export const projects: Project[] = [
  {
    id: "claims-triage",
    name: "Claims Triage Copilot",
    summary: "Reads new insurance claims, flags fraud signals and routes each claim to the right adjuster.",
    status: "live",
    agents: 4,
    updated: "12 min ago",
    framework: "LangGraph",
    url: "claims-triage.architect.new",
    evalScore: 94,
  },
  {
    id: "lead-researcher",
    name: "Lead Researcher",
    summary: "Researches inbound leads on the web and drafts a personalised first email for each.",
    status: "building",
    agents: 3,
    updated: "2 h ago",
    framework: "Lyzr Agents",
  },
  {
    id: "contract-review",
    name: "Contract Review Desk",
    summary: "Compares vendor contracts against your playbook and highlights risky clauses.",
    status: "draft",
    agents: 2,
    updated: "Yesterday",
    framework: "CrewAI",
  },
  {
    id: "resume-screener",
    name: "Resume Screener",
    summary: "Scores applicants against a job description and explains every score.",
    status: "live",
    agents: 2,
    updated: "3 days ago",
    framework: "Claude Agent SDK",
    url: "hire-desk.architect.new",
    evalScore: 88,
  },
];

export function getProject(id: string): Project {
  return projects.find((p) => p.id === id) ?? { ...projects[0], id, name: "Untitled project", status: "draft", url: undefined, evalScore: undefined, updated: "just now" };
}

export const starters = [
  "An agent that reads support tickets and drafts replies in our tone",
  "A dashboard where finance uploads invoices and agents flag mismatches",
  "A research assistant that watches competitors and sends a weekly brief",
  "A voice agent that books appointments into Google Calendar",
];
