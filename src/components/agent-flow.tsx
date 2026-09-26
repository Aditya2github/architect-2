import clsx from "clsx";
import { Bot } from "lucide-react";
import { agents, type Agent } from "@/lib/blueprint";

function Node({ agent, active, onSelect }: { agent: Agent; active?: boolean; onSelect?: (id: string) => void }) {
  const Tag = onSelect ? "button" : "div";
  return (
    <Tag
      onClick={onSelect ? () => onSelect(agent.id) : undefined}
      className={clsx(
        "grid w-full gap-1 rounded-lg border bg-surface p-3 text-left",
        active ? "border-agent ring-1 ring-agent" : "border-line",
        onSelect && "hover:border-line-strong",
      )}
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <span className="grid size-6 place-items-center rounded-md bg-agent-soft text-agent">
          <Bot className="size-3.5" />
        </span>
        {agent.name}
      </span>
      <span className="text-xs text-muted">{agent.tools.join(" · ")}</span>
    </Tag>
  );
}

function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1 text-[10px] font-mono uppercase tracking-wider text-faint" aria-hidden="true">
      <span className="h-4 w-px bg-line-strong" />
      {label && <span>{label}</span>}
      <span className="h-4 w-px bg-line-strong" />
    </div>
  );
}

/** Intake fans out to Fraud and Coverage in parallel, both feed the Router. */
export function AgentFlow({ selected, onSelect }: { selected?: string; onSelect?: (id: string) => void }) {
  const [intake, fraud, coverage, router] = agents;
  return (
    <div className="blueprint grid justify-items-center rounded-lg border border-line p-4">
      <div className="w-full max-w-[220px]"><Node agent={intake} active={selected === intake.id} onSelect={onSelect} /></div>
      <Connector label="in parallel" />
      <div className="grid w-full max-w-[460px] grid-cols-2 gap-3 border-t border-line-strong pt-3">
        <Node agent={fraud} active={selected === fraud.id} onSelect={onSelect} />
        <Node agent={coverage} active={selected === coverage.id} onSelect={onSelect} />
      </div>
      <div className="w-full max-w-[460px] border-b border-line-strong pb-0" aria-hidden="true" style={{ height: 12 }} />
      <Connector />
      <div className="w-full max-w-[220px]"><Node agent={router} active={selected === router.id} onSelect={onSelect} /></div>
    </div>
  );
}
