"use client";

import { useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff, Plus, Server } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { Button } from "@/components/ui";

const integrations = [
  { name: "Gmail", use: "Intake Reader reads the claims inbox", connected: true },
  { name: "Slack", use: "Router posts claim summaries", connected: true },
  { name: "Google Drive", use: "Adjuster roster", connected: true },
  { name: "Salesforce", use: "Not used yet", connected: false },
  { name: "HubSpot", use: "Not used yet", connected: false },
  { name: "Microsoft Teams", use: "Not used yet", connected: false },
];

const secrets = [
  { key: "CLAIMS_DB_URL", env: "All", value: "postgres://claims:••••@db.internal:5432/claims" },
  { key: "OCR_API_KEY", env: "Production", value: "ocr_live_••••••••••••3f9a" },
  { key: "SLACK_BOT_TOKEN", env: "All", value: "xoxb-••••••••••••••••" },
];

const people = [
  { name: "Aditya", role: "Owner" },
  { name: "Priya Nair", role: "Admin · approves production" },
  { name: "Rohan Iyer", role: "Viewer" },
];

export function ProjectSettingsView() {
  const { lens } = usePrefs();
  const [shown, setShown] = useState<string | null>(null);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-6 md:px-8">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Project settings</h1>
        <p className="text-sm text-muted">Tools your agents can use, the secrets they need, and who works on this project.</p>
      </div>

      <section className="grid gap-3">
        <h2 className="font-semibold">Connected tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((i) => (
            <div key={i.name} className="flex items-start justify-between gap-3 rounded-lg border border-line bg-surface p-4 text-sm">
              <div className="grid gap-0.5">
                <span className="font-medium">{i.name}</span>
                <span className="text-xs text-muted">{i.use}</span>
              </div>
              {i.connected ? <span className="rounded-full bg-good-soft px-2 py-0.5 text-xs text-good">Connected</span> : <Button size="sm">Connect</Button>}
            </div>
          ))}
        </div>
        {lens === "pro" && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-line-strong p-4 text-sm">
            <Server className="size-4 text-faint" />
            <span>MCP servers</span>
            <span className="font-mono text-xs text-muted">deepwiki · parallel-search</span>
            <Button size="sm" className="ml-auto"><Plus className="size-3.5" /> Add MCP server</Button>
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Secrets</h2>
          <Button size="sm"><Plus className="size-3.5" /> Add secret</Button>
        </div>
        <p className="text-sm text-muted">Stored encrypted in the vault. They never appear in your code or in chat.</p>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[560px] text-left text-sm">
            <tbody>
              {secrets.map((s) => (
                <tr key={s.key} className="border-t border-line first:border-t-0">
                  <td className="px-4 py-2.5 font-mono text-xs">{s.key}</td>
                  {lens === "pro" && <td className="px-4 py-2.5 text-xs text-muted">{s.env}</td>}
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{shown === s.key ? s.value : "••••••••••••"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => setShown(shown === s.key ? null : s.key)} aria-label={shown === s.key ? "Hide value" : "Show value"} className="text-muted hover:text-ink">
                      {shown === s.key ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">People</h2>
          <Button size="sm"><Plus className="size-3.5" /> Invite</Button>
        </div>
        <div className="grid gap-2">
          {people.map((p) => (
            <div key={p.name} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm">
              <span className={clsx("grid size-7 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent")}>{p.name[0]}</span>
              <span>{p.name}</span>
              <span className="ml-auto text-xs text-muted">{p.role}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
