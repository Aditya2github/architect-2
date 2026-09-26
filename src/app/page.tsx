import { ArrowRight, FlaskConical, GitPullRequest, ShieldCheck, Wallet } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/toggles";
import { LinkButton } from "@/components/ui";

const pillars = [
  {
    icon: FlaskConical,
    title: "Proof it works",
    body: "Every agent ships with evals and thousands of simulated conversations. You see a score before your users see a bug.",
  },
  {
    icon: Wallet,
    title: "No surprise bills",
    body: "See what a build will cost before you run it. Set a cap and Architect never goes past it.",
  },
  {
    icon: ShieldCheck,
    title: "Safe to go live",
    body: "Checkpoints on every change, separate preview and production, and a checklist that must pass before deploy.",
  },
  {
    icon: GitPullRequest,
    title: "Yours to take further",
    body: "Real code in your GitHub, any agent framework, and a CLI and MCP server for the editor you already use.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-full">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <LinkButton href="/login" variant="ghost" size="sm">Sign in</LinkButton>
          <LinkButton href="/login" variant="primary" size="sm">Start building</LinkButton>
        </nav>
      </header>

      <main>
        <section className="blueprint border-y border-line">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:py-28">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Architect 2.0</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-6xl">
              From prompt to production agent, with proof it works.
            </h1>
            <p className="max-w-xl text-lg text-muted">
              Describe the work. Architect plans it, builds the agents and the app around them, tests every answer, and puts it live. Built for the ops lead and the staff engineer alike.
            </p>
            <form action="/login" className="flex max-w-2xl flex-col gap-2 rounded-xl border border-line bg-surface p-2 shadow-sm sm:flex-row">
              <label htmlFor="landing-prompt" className="sr-only">What do you want to build?</label>
              <input
                id="landing-prompt"
                name="prompt"
                placeholder="An agent that triages insurance claims and flags fraud…"
                className="h-11 flex-1 bg-transparent px-3 text-[15px] outline-none placeholder:text-faint"
              />
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-accent-ink hover:opacity-90">
                Plan it <ArrowRight className="size-4" />
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-px overflow-hidden px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="grid content-start gap-3 border-line p-5 sm:border-l first:sm:border-l-0">
              <Icon className="size-5 text-accent" />
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-line px-5 py-8 text-sm text-faint">
        Architect 2.0 concept · built for the Lyzr AI product assignment
      </footer>
    </div>
  );
}
