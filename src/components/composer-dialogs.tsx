"use client";

import { useState } from "react";
import clsx from "clsx";
import { Bot, Check, GitBranch, Link2, Loader2, Server } from "lucide-react";
import { Dialog } from "@/components/dialog";
import { Button } from "@/components/ui";
import { appThemes, saveAppTheme, useAppTheme, type AppTheme } from "@/lib/app-theme";
import { usePrefs } from "@/components/providers";

function ThemeSwatch({ theme }: { theme: AppTheme }) {
  return (
    <div className="grid gap-1.5 rounded-md border p-2" style={{ background: theme.surface, borderColor: `${theme.accent}33`, colorScheme: "light" }}>
      <div className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm" style={{ background: theme.accent }} />
        <span className="h-1.5 w-12 rounded-full" style={{ background: theme.ink, opacity: 0.8 }} />
      </div>
      <span className="h-1.5 w-full rounded-full" style={{ background: theme.ink, opacity: 0.12 }} />
      <span className="h-1.5 w-2/3 rounded-full" style={{ background: theme.ink, opacity: 0.12 }} />
      <span className="h-4 w-14 rounded" style={{ background: theme.accent }} />
    </div>
  );
}

/** Pick the look of the app being built, or pull one from your own brand. */
export function ThemeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const current = useAppTheme();
  const [url, setUrl] = useState("");
  const [extracting, setExtracting] = useState(false);

  const extract = () => {
    const clean = url.trim().replace(/^https?:\/\//, "").split("/")[0];
    if (!clean) return;
    setExtracting(true);
    // Simulated brand extraction: a stable colour derived from the domain.
    let h = 0;
    for (const c of clean) h = (h * 31 + c.charCodeAt(0)) % 360;
    setTimeout(() => {
      saveAppTheme({ id: `custom-${clean}`, name: clean, accent: `hsl(${h} 62% 36%)`, surface: `hsl(${h} 30% 98%)`, ink: `hsl(${h} 30% 10%)`, font: "Matched from site", note: `Colours and type pulled from ${clean}.` });
      setExtracting(false);
      setUrl("");
    }, 1400);
  };

  return (
    <Dialog open={open} onClose={onClose} title="How should your app look?" description="Applies to the app Architect builds. Change it any time; the preview updates instantly." size="lg">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {appThemes.map((t) => (
          <button key={t.id} onClick={() => saveAppTheme(t)} aria-pressed={current.id === t.id} className={clsx("grid gap-2 rounded-lg border p-2.5 text-left", current.id === t.id ? "border-accent ring-1 ring-accent" : "border-line hover:border-line-strong")}>
            <ThemeSwatch theme={t} />
            <span className="flex items-center justify-between text-sm font-medium">{t.name}{current.id === t.id && <Check className="size-4 text-accent" />}</span>
            <span className="text-xs text-muted">{t.note}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-2 rounded-lg border border-dashed border-line-strong p-3">
        <label htmlFor="brand-url" className="text-sm font-medium">Use your brand</label>
        <p className="text-xs text-muted">Paste your website or Figma link. Architect pulls colours, type and logo into a theme.</p>
        <div className="flex gap-2">
          <input id="brand-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourcompany.com or figma.com/file/…" className="h-9 flex-1 rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-accent" />
          <Button onClick={extract} disabled={!url.trim() || extracting}>{extracting ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}{extracting ? "Reading…" : "Create theme"}</Button>
        </div>
        {current.id.startsWith("custom-") && <p className="text-xs text-good">Using your theme from {current.name}.</p>}
      </div>
      <div className="flex justify-end"><Button variant="primary" onClick={onClose}>Done</Button></div>
    </Dialog>
  );
}

export const toolCatalog = [
  { name: "Gmail", group: "Communication" }, { name: "Outlook", group: "Communication" }, { name: "Slack", group: "Communication" }, { name: "Microsoft Teams", group: "Communication" },
  { name: "HubSpot", group: "Customers" }, { name: "Salesforce", group: "Customers" }, { name: "Zendesk", group: "Customers" }, { name: "Intercom", group: "Customers" },
  { name: "Google Sheets", group: "Work" }, { name: "Google Calendar", group: "Work" }, { name: "Notion", group: "Work" }, { name: "Jira", group: "Work" },
  { name: "Web search", group: "Research" }, { name: "Postgres", group: "Data" }, { name: "Snowflake", group: "Data" }, { name: "Stripe", group: "Data" },
];

export function ToolsDialog({ open, onClose, selected, onChange }: { open: boolean; onClose: () => void; selected: string[]; onChange: (tools: string[]) => void }) {
  const { lens } = usePrefs();
  const [mcp, setMcp] = useState("");
  const toggle = (t: string) => onChange(selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t]);
  const groups = [...new Set(toolCatalog.map((t) => t.group))];
  return (
    <Dialog open={open} onClose={onClose} title="Which tools can the agents use?" description="Agents only get access to what you pick here. You connect each account the first time an agent needs it." size="lg">
      <div className="grid gap-4">
        {groups.map((g) => (
          <div key={g} className="grid gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">{g}</span>
            <div className="flex flex-wrap gap-2">
              {toolCatalog.filter((t) => t.group === g).map((t) => (
                <button key={t.name} onClick={() => toggle(t.name)} aria-pressed={selected.includes(t.name)} className={clsx("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm", selected.includes(t.name) ? "border-accent bg-accent-soft text-accent" : "border-line hover:border-line-strong")}>
                  {selected.includes(t.name) && <Check className="size-3.5" />}{t.name}
                </button>
              ))}
            </div>
          </div>
        ))}
        {lens === "pro" && (
          <div className="grid gap-2">
            <label htmlFor="mcp-url" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-faint"><Server className="size-3.5" /> MCP server</label>
            <div className="flex gap-2">
              <input id="mcp-url" value={mcp} onChange={(e) => setMcp(e.target.value)} placeholder="https://mcp.yourcompany.com/sse" className="h-9 flex-1 rounded-md border border-line bg-bg px-3 font-mono text-sm outline-none focus:border-accent" />
              <Button onClick={() => { if (mcp.trim()) { onChange([...selected, `MCP: ${mcp.trim().replace(/^https?:\/\//, "")}`]); setMcp(""); } }} disabled={!mcp.trim()}>Add</Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{selected.length} selected</span>
        <Button variant="primary" onClick={onClose}>Done</Button>
      </div>
    </Dialog>
  );
}

const studioAgents = [
  { name: "HR Policy Assistant", detail: "Answers questions from the employee handbook · 3 knowledge bases" },
  { name: "Invoice Extractor", detail: "Pulls vendor, amount and due date from PDFs · used in 2 apps" },
  { name: "Sales Call Summariser", detail: "Summarises Gong calls into CRM notes · Claude Sonnet 5" },
];

export function AgentsDialog({ open, onClose, selected, onChange }: { open: boolean; onClose: () => void; selected: string[]; onChange: (agents: string[]) => void }) {
  const [repo, setRepo] = useState("");
  const toggle = (a: string) => onChange(selected.includes(a) ? selected.filter((x) => x !== a) : [...selected, a]);
  return (
    <Dialog open={open} onClose={onClose} title="Reuse an agent you already have" description="Existing agents keep their instructions, tools and knowledge. The new app builds around them.">
      <div className="grid gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-faint">Your agents</span>
        {studioAgents.map((a) => (
          <button key={a.name} onClick={() => toggle(a.name)} aria-pressed={selected.includes(a.name)} className={clsx("flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left", selected.includes(a.name) ? "border-accent bg-accent-soft" : "border-line hover:border-line-strong")}>
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-agent-soft text-agent"><Bot className="size-4" /></span>
            <span className="grid flex-1"><span className="text-sm font-medium">{a.name}</span><span className="text-xs text-muted">{a.detail}</span></span>
            {selected.includes(a.name) && <Check className="size-4 text-accent" />}
          </button>
        ))}
      </div>
      <div className="grid gap-2">
        <label htmlFor="agent-repo" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-faint"><GitBranch className="size-3.5" /> From a git repo (LangGraph, CrewAI, GitAgent…)</label>
        <div className="flex gap-2">
          <input id="agent-repo" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="github.com/acme/support-agent" className="h-9 flex-1 rounded-md border border-line bg-bg px-3 font-mono text-sm outline-none focus:border-accent" />
          <Button onClick={() => { if (repo.trim()) { onChange([...selected, `repo: ${repo.trim().replace(/^https?:\/\//, "")}`]); setRepo(""); } }} disabled={!repo.trim()}>Add</Button>
        </div>
      </div>
      <div className="flex justify-end"><Button variant="primary" onClick={onClose}>Done</Button></div>
    </Dialog>
  );
}
