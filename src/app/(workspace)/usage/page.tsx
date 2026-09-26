import { PageHeader } from "@/components/ui";
import { user } from "@/lib/demo";

const byProject = [
  { name: "Claims Triage Copilot", build: 4.1, runs: 12.18 },
  { name: "Lead Researcher", build: 2.35, runs: 0 },
  { name: "Resume Screener", build: 1.9, runs: 3.06 },
  { name: "Contract Review Desk", build: 0.62, runs: 0 },
];

const builds = [
  ["Added weekly dashboard", "$0.40", "$0.38"],
  ["Fraud Scout explains each flag", "$0.42", "$0.47"],
  ["Slack summary for the Router", "$0.20", "$0.17"],
  ["First build from plan", "$2.80", "$2.61"],
];

export default function UsagePage() {
  const used = user.creditCap - user.credits;
  const max = Math.max(...byProject.map((p) => p.build + p.runs));
  return (
    <div className="grid gap-8">
      <PageHeader title="Usage & billing" description="Pro plan · $40 of credits a month · renews 1 Oct" />

      <section className="grid gap-4 rounded-xl border border-line bg-surface p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-2">
          <span className="text-sm text-muted">Left this month</span>
          <span className="text-3xl font-semibold tabular-nums">${user.credits.toFixed(2)}</span>
          <span className="h-2 overflow-hidden rounded-full bg-line">
            <span className="block h-full rounded-full bg-accent" style={{ width: `${(user.credits / user.creditCap) * 100}%` }} />
          </span>
          <span className="text-xs text-faint">${used.toFixed(2)} used of ${user.creditCap}</span>
        </div>
        <div className="grid content-start gap-2 text-sm">
          <label htmlFor="cap" className="text-muted">Monthly spending cap for running apps</label>
          <div className="flex items-center gap-2">
            <input id="cap" defaultValue="150" className="h-9 w-28 rounded-md border border-line bg-bg px-3 font-mono text-sm" />
            <span className="text-muted">USD. Apps pause instead of overspending, and you get an alert at 80%.</span>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="font-semibold">By project</h2>
        <div className="grid gap-2">
          {byProject.map((p) => (
            <div key={p.name} className="grid grid-cols-[minmax(0,180px)_minmax(0,1fr)_72px] items-center gap-3 text-sm">
              <span className="truncate">{p.name}</span>
              <span className="flex h-2.5 overflow-hidden rounded-full bg-line">
                <span className="bg-accent" style={{ width: `${(p.build / max) * 100}%` }} title="Building" />
                <span className="bg-agent" style={{ width: `${(p.runs / max) * 100}%` }} title="Running" />
              </span>
              <span className="text-right font-mono text-xs tabular-nums">${(p.build + p.runs).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-accent" /> Building</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-agent" /> Running in production</span>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="font-semibold">Estimate vs actual</h2>
        <p className="text-sm text-muted">Every build shows its estimate before it runs. Failed builds and self-fixes are free.</p>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-xs text-muted"><tr><th className="px-4 py-2 font-medium">Change</th><th className="px-4 py-2 text-right font-medium">Estimate</th><th className="px-4 py-2 text-right font-medium">Actual</th></tr></thead>
            <tbody>
              {builds.map(([c, e, a]) => (
                <tr key={c} className="border-t border-line">
                  <td className="px-4 py-2">{c}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs">{e}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs">{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
