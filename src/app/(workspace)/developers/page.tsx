import { KeyRound, Plus } from "lucide-react";
import { Button, PageHeader } from "@/components/ui";

const cli = `# Work on an Architect project from your own machine
npx architect login
npx architect pull claims-triage      # clone code + agents + env (secrets stay in the vault)
npx architect dev                     # run locally against preview data
npx architect eval fraud --simulate 1200
npx architect push                    # opens a pull request, runs checks
npx architect deploy --env staging`;

const mcp = `// .mcp.json  (Claude Code, Cursor, Codex)
{
  "mcpServers": {
    "architect": {
      "command": "npx",
      "args": ["-y", "@architect/mcp"],
      "env": { "ARCHITECT_API_KEY": "ak_live_…" }
    }
  }
}`;

const tools = ["plan_change", "build", "run_evals", "simulate", "get_traces", "deploy", "rollback"];

export default function DevelopersPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="Developers" description="Keep your editor. Use Architect for the agent infrastructure: evals, simulation, traces, environments and deploys." />

      <section className="grid gap-3">
        <h2 className="font-semibold">CLI</h2>
        <pre className="overflow-x-auto rounded-lg border border-line bg-[#07090d] p-4 font-mono text-[12.5px] leading-6 text-[#c9d1e0]">{cli}</pre>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-3">
          <h2 className="font-semibold">MCP server</h2>
          <p className="text-sm text-muted">Let Claude Code, Cursor or Codex drive Architect: plan a change, run evals on the agent they just edited, and ship it through your approval gates.</p>
          <pre className="overflow-x-auto rounded-lg border border-line bg-surface p-4 font-mono text-[12.5px] leading-6 text-muted">{mcp}</pre>
        </div>
        <div className="grid content-start gap-3">
          <h2 className="font-semibold">Tools it exposes</h2>
          <div className="flex flex-wrap gap-2">
            {tools.map((t) => <code key={t} className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-xs">{t}</code>)}
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">API keys</h2>
          <Button size="sm"><Plus className="size-3.5" /> Create key</Button>
        </div>
        {[["CI pipeline", "ak_live_…9f2c", "Used 2 h ago"], ["My laptop", "ak_live_…41ab", "Used today"]].map(([n, k, u]) => (
          <div key={n} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm">
            <KeyRound className="size-4 text-faint" />
            <span>{n}</span>
            <code className="font-mono text-xs text-muted">{k}</code>
            <span className="ml-auto text-xs text-faint">{u}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
