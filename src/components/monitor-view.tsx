"use client";

import clsx from "clsx";
import { AlertTriangle, Bell, TrendingDown, TrendingUp, Wrench } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { agents } from "@/lib/blueprint";
import { Button } from "@/components/ui";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const runs = [58, 71, 64, 83, 77, 22, 18];
const success = [96.1, 95.4, 97.2, 96.8, 97.5, 98.0, 97.9];

const issues = [
  { level: "warn", text: "Coverage Checker couldn't find the policy for 4 claims because the policy number had a space in it.", fix: "Ignore spaces in policy numbers" },
  { level: "bad", text: "Slack posts failed for 20 minutes on Thursday because the Slack token expired.", fix: "Reconnect Slack and resend the 7 missed posts" },
];

function RunsChart() {
  const max = 100;
  const w = 560;
  const h = 160;
  const pad = { l: 28, r: 8, t: 10, b: 22 };
  const bw = (w - pad.l - pad.r) / runs.length;
  const y = (v: number) => pad.t + (h - pad.t - pad.b) * (1 - v / max);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Claims handled per day this week">
      {[0, 50, 100].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray={t === 0 ? undefined : "3 3"} />
          <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="var(--faint)">{t}</text>
        </g>
      ))}
      {runs.map((v, i) => (
        <g key={i}>
          <rect x={pad.l + i * bw + bw * 0.22} y={y(v)} width={bw * 0.56} height={y(0) - y(v)} rx="3" fill={i === 3 ? "var(--accent)" : "var(--accent-soft)"} />
          <text x={pad.l + i * bw + bw / 2} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--muted)">{days[i]}</text>
          {i === 3 && <text x={pad.l + i * bw + bw / 2} y={y(v) - 5} textAnchor="middle" fontSize="10" fill="var(--ink)">{v}</text>}
        </g>
      ))}
    </svg>
  );
}

export function MonitorView() {
  const { lens } = usePrefs();
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Monitor</h1>
          <p className="text-sm text-muted">This week in production · claims-triage.architect.new</p>
        </div>
        <Button size="sm"><Bell className="size-3.5" /> Alerts</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Claims handled", "393", "+12%", true],
          ["Handled correctly", "97.0%", "+0.8 pts", true],
          ["Time to route", "3m 40s", "−1m 05s", true],
          ["Spend", "$12.18", "of $150 cap", null],
        ].map(([k, v, d, up]) => (
          <div key={k as string} className="grid gap-1 rounded-lg border border-line bg-surface p-4">
            <span className="text-xs text-muted">{k}</span>
            <span className="text-2xl font-semibold tabular-nums">{v}</span>
            <span className={clsx("flex items-center gap-1 text-xs", up === null ? "text-faint" : "text-good")}>
              {up !== null && (String(d).startsWith("−") ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />)}
              {d}
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="grid gap-3 rounded-xl border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Claims handled per day</h2>
            <span className="text-xs text-faint">Success rate {Math.min(...success)}–{Math.max(...success)}%</span>
          </div>
          <RunsChart />
        </section>

        <section className="grid content-start gap-3 rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Needs your attention</h2>
          {issues.map((i) => (
            <div key={i.text} className={clsx("grid gap-2 rounded-lg p-3 text-sm", i.level === "bad" ? "bg-bad-soft" : "bg-warn-soft")}>
              <span className="flex gap-2">
                <AlertTriangle className={clsx("mt-0.5 size-4 shrink-0", i.level === "bad" ? "text-bad" : "text-warn")} />
                {i.text}
              </span>
              <Button size="sm" className="justify-self-start"><Wrench className="size-3.5" /> {i.fix}</Button>
            </div>
          ))}
        </section>
      </div>

      {lens === "pro" && (
        <section className="grid gap-3">
          <h2 className="font-semibold">Per agent</h2>
          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr>{["Agent", "Runs", "Success", "p95 latency", "Cost / run", "Tokens (7d)"].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="font-mono text-xs">
                {agents.map((a, i) => (
                  <tr key={a.id} className="border-t border-line">
                    <td className="px-4 py-2 font-sans text-sm">{a.name}</td>
                    <td className="px-4 py-2 tabular-nums">393</td>
                    <td className="px-4 py-2 tabular-nums">{a.passRate}%</td>
                    <td className="px-4 py-2 tabular-nums">{a.p95}</td>
                    <td className="px-4 py-2 tabular-nums">{a.avgCost}</td>
                    <td className="px-4 py-2 tabular-nums">{["1.2M", "3.9M", "1.8M", "0.4M"][i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
