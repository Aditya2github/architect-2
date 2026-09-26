"use client";

import { useState } from "react";
import clsx from "clsx";
import { FileCode2, GitCompare } from "lucide-react";
import { files } from "@/lib/blueprint";

const diff = [
  { t: " ", l: "fraud_scout = Agent(" },
  { t: " ", l: '    name="Fraud Scout",' },
  { t: "-", l: '    model="claude-sonnet-5",' },
  { t: "+", l: '    model="claude-opus-5-5",' },
  { t: " ", l: "    tools=[similar_claims, web_search]," },
  { t: " ", l: '    instructions="""' },
  { t: "-", l: "    Flag suspicious claims." },
  { t: "+", l: "    Return a risk level (low, medium, high) and one line per" },
  { t: "+", l: "    reason, each with a link to the evidence." },
  { t: "+", l: "    Never accuse the customer; describe the signal." },
  { t: " ", l: '    """,' },
];

export function CodePanel() {
  const [active, setActive] = useState(files[0].path);
  const [showDiff, setShowDiff] = useState(false);
  const file = files.find((f) => f.path === active) ?? files[0];

  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)]">
      <div className="hidden border-r border-line bg-surface p-2 md:block">
        <p className="px-2 pb-2 font-mono text-[11px] uppercase tracking-wider text-faint">Files</p>
        {files.map((f) => (
          <button
            key={f.path}
            onClick={() => setActive(f.path)}
            className={clsx("flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-mono text-xs", active === f.path ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2")}
          >
            <FileCode2 className="size-3.5 shrink-0" />
            <span className="truncate">{f.path}</span>
            {f.path === "agents/fraud.py" && <span className="ml-auto text-warn">M</span>}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          <span className="truncate font-mono text-xs">{file.path}</span>
          {file.path === "agents/fraud.py" && (
            <button onClick={() => setShowDiff((d) => !d)} className={clsx("ml-auto flex items-center gap-1 rounded px-2 py-1 text-xs", showDiff ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2")}>
              <GitCompare className="size-3.5" /> {showDiff ? "Hide changes" : "Show last change"}
            </button>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-surface">
          {showDiff && file.path === "agents/fraud.py" ? (
            <pre className="py-3 font-mono text-[12.5px] leading-6">
              {diff.map((d, i) => (
                <div key={i} className={clsx("px-4", d.t === "+" && "bg-good-soft text-good", d.t === "-" && "bg-bad-soft text-bad")}>
                  <span className="mr-3 inline-block w-3 select-none opacity-70">{d.t}</span>{d.l}
                </div>
              ))}
            </pre>
          ) : (
            <pre className="py-3 font-mono text-[12.5px] leading-6">
              {file.code.split("\n").map((line, i) => (
                <div key={i} className="flex px-4">
                  <span className="mr-4 w-6 shrink-0 select-none text-right text-faint">{i + 1}</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export function TerminalPanel() {
  const lines = [
    ["$", "architect dev"],
    ["", "▲ Next.js ready on http://localhost:3000"],
    ["", "● agents: intake, fraud, coverage, router (LangGraph)"],
    ["$", "pytest evals/ -q"],
    ["", "........................................ 40 passed in 11.2s"],
    ["$", "architect eval fraud --simulate 1200"],
    ["", "simulating 1,200 claims across 9 personas…"],
    ["", "pass 93.1% · false positives 2.4% · p95 4.6s · $0.019/claim"],
    ["$", ""],
  ];
  return (
    <pre className="h-full overflow-auto bg-[#07090d] p-4 font-mono text-[12.5px] leading-6 text-[#c9d1e0]">
      {lines.map(([p, l], i) => (
        <div key={i}>
          {p && <span className="mr-2 text-[#7088ff]">{p}</span>}
          {l}
          {i === lines.length - 1 && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[#c9d1e0]" />}
        </div>
      ))}
    </pre>
  );
}

export function LogsPanel() {
  const logs = [
    ["12:41:08", "info", "intake", "CLM-20931 parsed · 3 documents · policy MTR-88213"],
    ["12:41:10", "info", "fraud", "CLM-20931 risk=low · 0 rules matched"],
    ["12:41:10", "info", "coverage", "CLM-20931 covered · clause 4.2(b)"],
    ["12:41:11", "info", "router", "CLM-20931 → R. Iyer · posted to #claims-motor"],
    ["12:48:52", "warn", "fraud", "CLM-20930 risk=high · 3 rules: prior claim 60d, amount > 3× avg, new policy"],
    ["12:48:53", "info", "router", "CLM-20930 → Investigations"],
    ["12:55:17", "error", "intake", "CLM-20929 OCR timeout on receipt.jpg · retried · ok"],
  ];
  const tone = { info: "text-muted", warn: "text-warn", error: "text-bad" } as const;
  return (
    <div className="h-full overflow-auto bg-surface font-mono text-xs">
      {logs.map(([t, level, agent, msg], i) => (
        <div key={i} className="flex gap-4 border-b border-line px-4 py-2">
          <span className="shrink-0 text-faint">{t}</span>
          <span className={clsx("w-10 shrink-0 uppercase", tone[level as keyof typeof tone])}>{level}</span>
          <span className="w-16 shrink-0 text-agent">{agent}</span>
          <span className="text-ink">{msg}</span>
        </div>
      ))}
    </div>
  );
}
