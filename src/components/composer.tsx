"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowUp, Bot, FileSpreadsheet, FileText, Lightbulb, Paperclip, Palette, Plug, X } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { AgentsDialog, ThemeDialog, ToolsDialog } from "@/components/composer-dialogs";
import { starters } from "@/lib/demo";
import { createProject } from "@/app/actions";
import { formatBytes, ideasFromColumns, readAttachment, type Attachment } from "@/lib/attachments";
import { useAppTheme } from "@/lib/app-theme";

export const openAttach = () => window.dispatchEvent(new Event("architect:attach"));

/** The home prompt box. Submitting always goes to the plan step first, never straight to a build. */
export function Composer() {
  const router = useRouter();
  const { lens } = usePrefs();
  const appTheme = useAppTheme();
  const fileInput = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [tools, setTools] = useState<string[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [dialog, setDialog] = useState<"theme" | "tools" | "agents" | null>(null);

  useEffect(() => {
    const onAttach = () => fileInput.current?.click();
    window.addEventListener("architect:attach", onAttach);
    return () => window.removeEventListener("architect:attach", onAttach);
  }, []);

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    setReading(true);
    const read = await Promise.all([...list].slice(0, 5).map(readAttachment));
    setFiles((f) => [...f, ...read].slice(0, 6));
    setReading(false);
  };

  const context = () => {
    const parts: string[] = [];
    if (files.length) parts.push(`Data: ${files.map((f) => (f.columns?.length ? `${f.name} (${f.rows} rows; columns ${f.columns.slice(0, 8).join(", ")})` : f.name)).join("; ")}`);
    if (tools.length) parts.push(`Tools: ${tools.join(", ")}`);
    if (agents.length) parts.push(`Reuse agents: ${agents.join(", ")}`);
    return parts.length ? `\n\n${parts.join("\n")}` : "";
  };

  // Signed-in users get the project saved to their account first; demo visitors skip straight to the plan.
  const submit = async () => {
    const prompt = (value.trim() + context()).trim();
    if (!value.trim() || saving) return;
    setSaving(true);
    const { id } = await createProject(prompt).catch(() => ({ id: "new" }));
    router.push(`/p/${id}/plan?prompt=${encodeURIComponent(prompt)}`);
  };

  const table = files.find((f) => f.columns?.length);
  const ideas = table ? ideasFromColumns(table.name, table.columns!) : [];

  return (
    <div className="grid gap-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={clsx("rounded-xl border bg-surface shadow-sm focus-within:border-accent", dragging ? "border-accent ring-2 ring-accent/30" : "border-line")}
      >
        <label htmlFor="home-prompt" className="sr-only">Describe what you want to build</label>
        <textarea
          id="home-prompt"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={3}
          placeholder={
            dragging
              ? "Drop it here: spreadsheets become tables, documents become knowledge."
              : lens === "pro"
                ? "Describe the agent, or paste a spec. e.g. LangGraph agent that triages claims from S3, Postgres for state…"
                : "Describe the work you want an agent to do, or drop in a spreadsheet or document…"
          }
          className="w-full resize-none bg-transparent px-4 pt-4 text-[15px] leading-relaxed outline-none placeholder:text-faint"
        />

        {(files.length > 0 || tools.length > 0 || agents.length > 0 || reading) && (
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {files.map((f, i) => (
              <span key={f.name + i} className="flex max-w-full items-center gap-1.5 rounded-md border border-line bg-bg py-1 pr-1 pl-2 text-xs" title={f.summary}>
                {f.kind === "table" ? <FileSpreadsheet className="size-3.5 shrink-0 text-good" /> : <FileText className="size-3.5 shrink-0 text-accent" />}
                <span className="truncate font-medium">{f.name}</span>
                <span className="hidden truncate text-muted sm:inline">{f.summary.split(" → ")[0]}</span>
                <button onClick={() => setFiles((all) => all.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`} className="grid size-5 place-items-center rounded text-faint hover:bg-surface-2 hover:text-ink"><X className="size-3" /></button>
              </span>
            ))}
            {reading && <span className="rounded-md border border-line px-2 py-1 text-xs text-muted">Reading file…</span>}
            {tools.map((t) => <span key={t} className="rounded-md bg-accent-soft px-2 py-1 text-xs text-accent">{t}</span>)}
            {agents.map((a) => <span key={a} className="rounded-md bg-agent-soft px-2 py-1 text-xs text-agent">{a}</span>)}
          </div>
        )}

        <div className="flex items-center gap-1 px-2 pb-2">
          <input ref={fileInput} id="attach-input" type="file" multiple accept=".csv,.tsv,.xlsx,.xls,.pdf,.docx,.txt,.md" className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <button onClick={() => fileInput.current?.click()} title="Attach spreadsheets or documents" className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-surface-2 hover:text-ink">
            <Paperclip className="size-4" /><span className="hidden sm:inline">Attach</span>
          </button>
          <button onClick={() => setDialog("theme")} title="Look of your app" className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-surface-2 hover:text-ink">
            <span className="size-3 rounded-sm" style={{ background: appTheme.accent }} /><span className="hidden sm:inline">{appTheme.name}</span>
            <Palette className="size-4 sm:hidden" />
          </button>
          <button onClick={() => setDialog("tools")} title="Tools agents can use" className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-surface-2 hover:text-ink">
            <Plug className="size-4" /><span className="hidden sm:inline">Tools{tools.length ? ` · ${tools.length}` : ""}</span>
          </button>
          <button onClick={() => setDialog("agents")} title="Reuse an existing agent" className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-surface-2 hover:text-ink">
            <Bot className="size-4" /><span className="hidden md:inline">Your agents{agents.length ? ` · ${agents.length}` : ""}</span>
          </button>
          <button
            onClick={submit}
            disabled={!value.trim() || saving}
            aria-label="Plan it"
            className="ml-auto flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-accent-ink hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Plan it"} <ArrowUp className="size-4" />
          </button>
        </div>
      </div>

      {ideas.length > 0 && (
        <div className="grid gap-2 rounded-xl border border-good/30 bg-good-soft/50 p-4">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="size-4 text-good" /> From {table!.name}: {table!.rows?.toLocaleString("en-US")} rows, columns {table!.columns!.slice(0, 5).join(", ")}{table!.columns!.length > 5 ? "…" : ""}
          </span>
          <div className="grid gap-1.5">
            {ideas.map((idea) => (
              <button key={idea} onClick={() => setValue(idea)} className="rounded-md border border-line bg-surface px-3 py-2 text-left text-sm hover:border-accent">{idea}</button>
            ))}
          </div>
          <span className="text-xs text-muted">Read in your browser; nothing was uploaded. {files.length} file{files.length === 1 ? "" : "s"}, {formatBytes(files.reduce((s, f) => s + f.size, 0))}.</span>
        </div>
      )}

      {files.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {starters.map((s) => (
            <button key={s} onClick={() => setValue(s)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted hover:border-line-strong hover:text-ink">
              {s}
            </button>
          ))}
        </div>
      )}

      <ThemeDialog open={dialog === "theme"} onClose={() => setDialog(null)} />
      <ToolsDialog open={dialog === "tools"} onClose={() => setDialog(null)} selected={tools} onChange={setTools} />
      <AgentsDialog open={dialog === "agents"} onClose={() => setDialog(null)} selected={agents} onChange={setAgents} />
    </div>
  );
}
