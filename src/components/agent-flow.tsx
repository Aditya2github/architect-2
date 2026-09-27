import clsx from "clsx";
import { Bot } from "lucide-react";

export type FlowAgent = { id: string; name: string; tools: string[] };

function Node({ agent, active, onSelect }: { agent: FlowAgent; active?: boolean; onSelect?: (id: string) => void }) {
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
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-agent-soft text-agent">
          <Bot className="size-3.5" />
        </span>
        {agent.name}
      </span>
      <span className="text-xs text-muted">{agent.tools.length ? agent.tools.join(" · ") : "No outside tools"}</span>
    </Tag>
  );
}

function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1 font-mono text-[10px] uppercase tracking-wider text-faint" aria-hidden="true">
      <span className="h-4 w-px bg-line-strong" />
      {label && <span>{label}</span>}
      <span className="h-4 w-px bg-line-strong" />
    </div>
  );
}

/** First agent takes the work in, the middle ones run in parallel, the last one hands it off. */
export function AgentFlow({ agents, selected, onSelect }: { agents: FlowAgent[]; selected?: string; onSelect?: (id: string) => void }) {
  if (agents.length === 0) return null;
  const first = agents[0];
  const last = agents.length > 1 ? agents[agents.length - 1] : null;
  const middle = agents.slice(1, agents.length > 1 ? -1 : 1);

  return (
    <div className="blueprint grid justify-items-center rounded-lg border border-line p-4">
      <div className="w-full max-w-[240px]"><Node agent={first} active={selected === first.id} onSelect={onSelect} /></div>
      {middle.length > 0 && (
        <>
          <Connector label={middle.length > 1 ? "in parallel" : undefined} />
          <div className={clsx("grid w-full gap-3", middle.length > 1 && "max-w-[520px] border-t border-line-strong pt-3", middle.length === 1 && "max-w-[240px]", middle.length === 2 && "grid-cols-2", middle.length >= 3 && "grid-cols-2 sm:grid-cols-3")}>
            {middle.map((a) => <Node key={a.id} agent={a} active={selected === a.id} onSelect={onSelect} />)}
          </div>
        </>
      )}
      {last && (
        <>
          <Connector />
          <div className="w-full max-w-[240px]"><Node agent={last} active={selected === last.id} onSelect={onSelect} /></div>
        </>
      )}
    </div>
  );
}
