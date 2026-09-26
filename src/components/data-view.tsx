"use client";

import { useState } from "react";
import clsx from "clsx";
import { Download, FileText, Play, Table2 } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { claims } from "@/lib/blueprint";
import { Button } from "@/components/ui";

const tables = [
  { name: "claims", rows: 2184 },
  { name: "claim_flags", rows: 311 },
  { name: "adjusters", rows: 12 },
  { name: "users", rows: 19 },
];

const knowledge = [
  { name: "Fraud rules playbook.pdf", size: "2.1 MB", status: "Indexed" },
  { name: "Policy wordings (312 files)", size: "184 MB", status: "Indexed" },
  { name: "Adjuster roster.xlsx", size: "48 KB", status: "Synced from Google Drive" },
];

export function DataView() {
  const { lens } = usePrefs();
  const [active, setActive] = useState("claims");
  const [ran, setRan] = useState(false);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:px-8">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Data</h1>
        <p className="text-sm text-muted">What your app stores, and the files your agents read. Each user only sees their own rows.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="flex gap-1 overflow-x-auto lg:grid lg:content-start">
          {tables.map((t) => (
            <button key={t.name} onClick={() => setActive(t.name)} className={clsx("flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm", active === t.name ? "bg-surface-2 text-ink" : "text-muted hover:text-ink")}>
              <Table2 className="size-4" /> <span className="font-mono">{t.name}</span>
              <span className="ml-auto text-xs text-faint tabular-nums">{t.rows.toLocaleString("en-US")}</span>
            </button>
          ))}
        </nav>

        <div className="grid min-w-0 gap-4">
          {lens === "pro" && (
            <div className="grid gap-2 rounded-lg border border-line bg-surface p-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto whitespace-pre font-mono text-xs text-muted">select risk, count(*), avg(amount) from claims where received_at &gt; now() - interval &apos;7 days&apos; group by risk;</code>
                <Button size="sm" onClick={() => setRan(true)}><Play className="size-3.5" /> Run</Button>
              </div>
              {ran && (
                <table className="w-full font-mono text-xs">
                  <thead className="text-faint"><tr><th className="py-1 text-left font-normal">risk</th><th className="text-right font-normal">count</th><th className="text-right font-normal">avg</th></tr></thead>
                  <tbody>
                    {[["low", 318, "1,204.50"], ["medium", 58, "8,930.10"], ["high", 17, "27,610.00"]].map((r) => (
                      <tr key={r[0]} className="border-t border-line"><td className="py-1">{r[0]}</td><td className="text-right">{r[1]}</td><td className="text-right">{r[2]}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <span className="font-mono text-sm">{active}</span>
              <Button size="sm" variant="ghost"><Download className="size-3.5" /> Export CSV</Button>
            </div>
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr>{["id", "customer", "type", "amount", "risk", "assignee"].map((h) => <th key={h} className="px-4 py-2 font-mono font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <td className="px-4 py-2 font-mono text-xs">{c.id}</td>
                    <td className="px-4 py-2">{c.customer}</td>
                    <td className="px-4 py-2 text-muted">{c.type}</td>
                    <td className="px-4 py-2 tabular-nums">{c.amount.toLocaleString("en-US")}</td>
                    <td className="px-4 py-2">{c.risk}</td>
                    <td className="px-4 py-2 text-muted">{c.assignee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="grid gap-2">
            <h2 className="font-semibold">Knowledge your agents read</h2>
            {knowledge.map((k) => (
              <div key={k.name} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm">
                <FileText className="size-4 text-faint" />
                <span>{k.name}</span>
                <span className="text-xs text-faint">{k.size}</span>
                <span className="ml-auto text-xs text-good">{k.status}</span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
