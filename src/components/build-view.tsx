"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  ArrowUp, Check, Circle, History, Loader2, Monitor, MousePointerClick, RotateCcw, Smartphone, Sparkles, Tablet, Undo2,
} from "lucide-react";
import { usePrefs } from "@/components/providers";
import { MockClaimsApp } from "@/components/mock-app";
import { CodePanel, LogsPanel, TerminalPanel } from "@/components/code-panel";
import { buildSteps, checkpoints } from "@/lib/blueprint";

type Msg =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string }
  | { kind: "estimate"; text: string; cost: string; id: number; used?: boolean }
  | { kind: "timeline" };

type Phase = "idle" | "building" | "done";
type View = "preview" | "code" | "terminal" | "logs";
type Device = "desktop" | "tablet" | "phone";

const deviceWidth: Record<Device, string> = { desktop: "100%", tablet: "768px", phone: "390px" };

const seed: Msg[] = [
  { kind: "user", text: "Make the Fraud Scout explain every flag with a link to the evidence." },
  { kind: "assistant", text: "Done. Fraud Scout now returns one line per reason with an evidence link, and I moved it to a stronger model for accuracy. Eval score went from 86 to 91. Saved as a checkpoint." },
];

export function BuildView({ autoBuild }: { autoBuild: boolean }) {
  const { lens } = usePrefs();
  const [messages, setMessages] = useState<Msg[]>(autoBuild ? [{ kind: "assistant", text: "Plan approved. Building now; you can keep chatting while I work." }, { kind: "timeline" }] : seed);
  const [phase, setPhase] = useState<Phase>(autoBuild ? "building" : "done");
  const [step, setStep] = useState(autoBuild ? 0 : buildSteps.length);
  const [view, setView] = useState<View>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [picking, setPicking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Advance the build one step at a time.
  useEffect(() => {
    if (phase !== "building") return;
    if (step >= buildSteps.length) {
      const t = setTimeout(() => {
        setPhase("done");
        setMessages((m) => [...m, { kind: "assistant", text: "Your app is built and verified: 18 browser checks passed, and the agents scored 94/100 on 1,200 simulated claims. Saved as a checkpoint. Try it in the preview." }]);
      }, 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), buildSteps[step].seconds * 700);
    return () => clearTimeout(t);
  }, [phase, step]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, step]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setDraft("");
    setMessages((m) => [
      ...m,
      { kind: "user", text: t },
      { kind: "estimate", id: Date.now(), text: "Here's what I'll change: update the claims table and its API, then re-run the browser checks.", cost: "$0.42" },
    ]);
  };

  const startBuild = (id: number) => {
    setMessages((m) => [...m.map((x) => (x.kind === "estimate" && x.id === id ? { ...x, used: true } : x)), { kind: "timeline" }]);
    setStep(0);
    setPhase("building");
  };

  const lastTimeline = messages.map((m) => m.kind).lastIndexOf("timeline");
  const views: { id: View; label: string }[] =
    lens === "pro"
      ? [{ id: "preview", label: "Preview" }, { id: "code", label: "Code" }, { id: "terminal", label: "Terminal" }, { id: "logs", label: "Logs" }]
      : [{ id: "preview", label: "Preview" }];
  const activeView = views.some((v) => v.id === view) ? view : "preview";

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1.2fr)] lg:grid-cols-[360px_minmax(0,1fr)] lg:grid-rows-1">
      {/* Chat */}
      <section className="flex min-h-0 flex-col border-b border-line bg-surface lg:border-r lg:border-b-0">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m, i) => {
            if (m.kind === "user") return <div key={i} className="ml-8 rounded-lg bg-accent-soft px-3 py-2 text-sm">{m.text}</div>;
            if (m.kind === "assistant")
              return (
                <div key={i} className="flex gap-2 text-sm">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
                  <p>{m.text}</p>
                </div>
              );
            if (m.kind === "estimate")
              return (
                <div key={i} className="grid gap-3 rounded-lg border border-line p-3 text-sm">
                  <p>{m.text}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Estimated cost</span>
                    <span className="font-mono font-medium">{m.cost}</span>
                    {m.used ? (
                      <span className="ml-auto text-xs text-faint">Approved</span>
                    ) : (
                      <button onClick={() => startBuild(m.id)} disabled={phase === "building"} className="ml-auto rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-ink disabled:opacity-40">
                        Build it
                      </button>
                    )}
                  </div>
                </div>
              );
            return <Timeline key={i} step={i === lastTimeline ? step : buildSteps.length} pro={lens === "pro"} />;
          })}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="border-t border-line p-3"
        >
          <div className="rounded-lg border border-line bg-bg focus-within:border-accent">
            <label htmlFor="build-chat" className="sr-only">Describe a change</label>
            <textarea
              id="build-chat"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              placeholder="Describe a change…"
              className="w-full resize-none bg-transparent px-3 pt-2.5 text-sm outline-none placeholder:text-faint"
            />
            <div className="flex items-center gap-2 px-2 pb-2">
              <span className="text-xs text-faint">You approve the cost before anything runs</span>
              <button type="submit" disabled={!draft.trim()} aria-label="Send" className="ml-auto grid size-7 place-items-center rounded-md bg-accent text-accent-ink disabled:opacity-40">
                <ArrowUp className="size-4" />
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Canvas */}
      <section className="flex min-h-0 min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
          <div className="flex gap-1">
            {views.map((v) => (
              <button key={v.id} onClick={() => setView(v.id)} className={clsx("rounded-md px-3 py-1.5 text-sm", activeView === v.id ? "bg-surface-2 text-ink" : "text-muted hover:text-ink")}>
                {v.label}
              </button>
            ))}
          </div>
          {activeView === "preview" && (
            <>
              <div className="ml-auto flex rounded-md border border-line p-0.5">
                {([["desktop", Monitor], ["tablet", Tablet], ["phone", Smartphone]] as const).map(([d, Icon]) => (
                  <button key={d} onClick={() => setDevice(d)} aria-label={d} className={clsx("grid size-7 place-items-center rounded", device === d ? "bg-surface-2 text-ink" : "text-muted")}>
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
              <button onClick={() => setPicking((p) => !p)} className={clsx("flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm", picking ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2")}>
                <MousePointerClick className="size-4" /> Edit visually
              </button>
            </>
          )}
          <div className={clsx("relative", activeView !== "preview" && "ml-auto")}>
            <button onClick={() => setShowHistory((h) => !h)} className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted hover:bg-surface-2">
              <History className="size-4" /> Checkpoints
            </button>
            {showHistory && (
              <div className="absolute right-0 top-10 z-30 w-72 rounded-lg border border-line bg-surface p-2 shadow-xl">
                {checkpoints.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-surface-2">
                    <Circle className={clsx("size-2.5 shrink-0", i === 0 ? "fill-accent text-accent" : "text-faint")} />
                    <div className="grid min-w-0 flex-1">
                      <span className="truncate text-sm">{c.label}</span>
                      <span className="text-xs text-faint">{c.when} · {c.by}</span>
                    </div>
                    {i > 0 && (
                      <button
                        onClick={() => {
                          setShowHistory(false);
                          setMessages((m) => [...m, { kind: "assistant", text: `Restored "${c.label}". Nothing was deleted; you can jump forward again from Checkpoints.` }]);
                        }}
                        className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted hover:text-ink"
                      >
                        <RotateCcw className="size-3" /> Restore
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-auto bg-surface-2">
          {activeView === "preview" && (
            <div className="flex h-full justify-center p-4">
              <div className="relative h-fit w-full transition-[max-width] duration-300" style={{ maxWidth: deviceWidth[device] }}>
                <div className="flex items-center gap-2 rounded-t-md border border-b-0 border-line bg-surface px-3 py-1.5">
                  <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="size-2 rounded-full bg-line-strong" />)}</span>
                  <span className="mx-auto font-mono text-[11px] text-faint">claims-triage.preview.architect.new</span>
                </div>
                <div className={clsx("rounded-b-md border border-line", phase === "building" && "opacity-40 blur-[1px]")}>
                  <MockClaimsApp compact={device === "phone"} highlight={picking} />
                </div>
                {picking && phase !== "building" && (
                  <div className="absolute left-1/2 top-1/2 z-10 grid w-64 -translate-x-1/2 gap-2 rounded-lg border border-line bg-surface p-3 text-sm shadow-xl">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-faint">Selected · Claims table</span>
                    {["Sort by risk, highest first", "Add a 'Days open' column", "Make rows more compact"].map((o) => (
                      <button key={o} onClick={() => { setPicking(false); send(o); }} className="rounded-md border border-line px-2.5 py-1.5 text-left text-xs hover:border-accent">
                        {o}
                      </button>
                    ))}
                  </div>
                )}
                {phase === "building" && (
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm shadow">
                      <Loader2 className="size-4 animate-spin text-accent" /> {buildSteps[Math.min(step, buildSteps.length - 1)].label}…
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeView === "code" && <CodePanel />}
          {activeView === "terminal" && <TerminalPanel />}
          {activeView === "logs" && <LogsPanel />}
        </div>
      </section>
    </div>
  );
}

function Timeline({ step, pro }: { step: number; pro: boolean }) {
  const done = step >= buildSteps.length;
  return (
    <div className="grid gap-0 rounded-lg border border-line p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium">{done ? "Build complete" : "Building"}</span>
        {done && <span className="flex items-center gap-1 text-xs text-muted"><Undo2 className="size-3" /> Checkpoint saved</span>}
      </div>
      <ol className="grid gap-2">
        {buildSteps.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          return (
            <li key={s.id} className="flex gap-2.5 text-sm">
              <span className="mt-0.5">
                {state === "done" ? <Check className="size-4 text-good" /> : state === "active" ? <Loader2 className="size-4 animate-spin text-accent" /> : <Circle className="size-4 text-line-strong" />}
              </span>
              <div className={clsx("grid gap-0.5", state === "todo" && "text-faint")}>
                <span>{s.label}</span>
                {state !== "todo" && <span className="text-xs text-muted">{s.detail}</span>}
                {pro && state !== "todo" && s.files.length > 0 && (
                  <span className="font-mono text-[11px] text-faint">{s.files.join("  ")}</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
