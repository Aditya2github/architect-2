# Architect 2.0

**From prompt to production agent, with proof it works.**

A concept for the next version of [Architect](https://architect.new), built for the Lyzr AI Technical PM assignment. Architect 2.0 is a vibe-coding platform for building agentic apps, designed for two audiences at once: an operations lead who has never opened a terminal, and a staff engineer who lives in Claude Code or Cursor.

## The idea in one screen

Most vibe-coding tools help you *build an app*. Coding agents help you *write code*. Neither tells you whether the AI agents inside your app actually work. Architect 2.0 is built around that gap:

| Problem users report today | What Architect 2.0 does |
|---|---|
| "Credits disappear" in fix-it loops | Every change shows a **cost estimate before it runs**; spending caps; failed builds and self-fixes are free |
| "It worked in the demo" | Every agent gets an **eval score and 1,200 simulated users** before it can go live |
| AI agents breaking production | **Checkpoints** on every change, **preview → staging → production**, and approval gates |
| Security holes in generated apps | Deploy is blocked until **tests, a security scan, secrets and evals** all pass |
| Developers lose control | **Pro view**: code, diffs, terminal, traces, branch-per-task pull requests, CLI and MCP server |

## One project, two lenses

There is no separate "developer mode" product. Every screen has a **Simple** and a **Pro** view of the same project (toggle in the top bar, remembered per user):

- **Simple:** plain-language plans, visual editing of the preview, agent report cards, a one-button "Go live" checklist.
- **Pro:** file tree and diffs, terminal and logs, framework choice (Lyzr Agents, LangGraph, CrewAI, OpenAI Agents SDK, Claude Agent SDK, GitAgent), run traces, environments, pull requests, SQL console.

## Walkthrough

1. **Landing → Sign in** (GitHub, Google or email magic link) **→ Onboarding** (pick your default view, role and tools).
2. **Home:** describe an idea, start from a blueprint, answer 3 questions in *Help me decide*, or import a repo.
3. **Plan:** scoping questions → plan, agent diagram, UI mockup, and a **cost and time estimate**. Approve to build.
4. **Build:** chat on the left, live preview on the right, a build timeline with checkpoints. Try *Edit visually* or restore a checkpoint.
5. **Agents:** the agent graph, setup, a test chat, **evals with simulation results and failure cases**, and traces (Pro).
6. **GitHub:** connect a repo, auto-save or branch-per-task PRs with checks.
7. **Deploy:** pre-flight checklist → live URL; environments, promote and roll back (Pro).
8. **Monitor, Data, Settings, Usage, Team, Developers** round out the product.

## What actually works

- **Sign-in with Supabase Auth:** GitHub OAuth and passwordless email links, session refresh in `src/proxy.ts`, and an OAuth callback route.
- **Database with row-level security:** projects you create from the home prompt and your onboarding choices are saved to Postgres. Each user can only read their own rows (see `supabase/schema.sql`).
- **Demo mode:** without Supabase env vars the whole app runs on seeded demo data, so every flow can be explored without an account.

Everything else (building, evals, deploys) is a scripted flow that shows the intended product behaviour.

## Stack

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Auth + Postgres) · lucide-react · Vercel

## Run it locally

```bash
npm install
cp .env.example .env.local   # optional: fill in Supabase keys for real sign-in
npm run dev
```

To enable real auth, create a Supabase project, run `supabase/schema.sql` in the SQL editor, and set:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # anon or publishable key
```

## Project map

```
src/app/                 routes: landing, login, onboarding, (workspace)/*, p/[id]/*
src/app/actions.ts       server actions: create project, save profile, sign out
src/app/auth/callback    OAuth / magic-link code exchange
src/proxy.ts             keeps the Supabase session fresh
src/components/          shells, plan/build/agents/deploy views, UI primitives
src/lib/blueprint.ts     the demo app's plan, agents, files and data
src/lib/supabase/        server and browser clients (null in demo mode)
supabase/schema.sql      tables and row-level security policies
```
