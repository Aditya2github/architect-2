import type { Plan } from "@/lib/plan";

// Preview of an app built from a generated plan. Uses its own fixed light palette,
// because it is the customer's app, not Architect's UI.

const statuses = ["Done", "Needs review", "In progress", "Done", "Done"];
const tone: Record<string, string> = {
  Done: "bg-[#e6f4ea] text-[#1e7a3c]",
  "Needs review": "bg-[#fdf1dc] text-[#9a5a00]",
  "In progress": "bg-[#e8ecfe] text-[#3355f0]",
};

export function PlanApp({ plan, compact = false, highlight = false }: { plan: Plan; compact?: boolean; highlight?: boolean }) {
  const initials = plan.title.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const unit = plan.data[0]?.replace(/s$/, "").replace(/_/g, " ") || "item";
  const rows = plan.agents.slice(0, compact ? 3 : 5).map((a, i) => ({
    id: `#${1042 - i}`,
    what: `New ${unit} ${String.fromCharCode(65 + i)}`,
    agent: a.name,
    status: statuses[i % statuses.length],
    when: `${4 + i * 7} min ago`,
  }));

  return (
    <div className="h-full overflow-hidden rounded-md bg-[#f7f8fa] text-[#131722]" style={{ colorScheme: "light" }}>
      <div className="flex items-center gap-3 border-b border-[#e3e6eb] bg-white px-4 py-2.5">
        <span className="grid size-6 place-items-center rounded bg-[#1f3a8a] text-[11px] font-bold text-white">{initials}</span>
        <span className="truncate text-sm font-semibold">{plan.title}</span>
        {!compact && (
          <nav className="ml-4 hidden gap-4 text-xs text-[#5b6272] sm:flex">
            {plan.screens.slice(0, 3).map((s, i) => (
              <span key={s} className={i === 0 ? "font-medium text-[#131722]" : ""}>{s}</span>
            ))}
          </nav>
        )}
      </div>

      <div className="grid gap-3 p-4">
        {!compact && (
          <div className="grid grid-cols-3 gap-2">
            {[
              [`${unit}s today`, "48"],
              ["Handled by agents", "41"],
              ["Waiting for a person", "7"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border border-[#e3e6eb] bg-white p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-[#5b6272]">{k}</div>
                <div className="text-lg font-semibold tabular-nums">{v}</div>
              </div>
            ))}
          </div>
        )}
        <div className={`overflow-hidden rounded-md border bg-white ${highlight ? "border-[#3355f0] ring-2 ring-[#3355f0]/30" : "border-[#e3e6eb]"}`}>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f4f7] text-[10px] uppercase tracking-wide text-[#5b6272]">
              <tr>
                <th className="px-3 py-2 font-medium">{unit}</th>
                {!compact && <th className="px-3 py-2 font-medium">Last agent</th>}
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[#eef0f3]">
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.what}</div>
                    <div className="font-mono text-[10px] text-[#8a91a0]">{r.id} · {r.when}</div>
                  </td>
                  {!compact && <td className="px-3 py-2 text-[#3d4452]">{r.agent}</td>}
                  <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone[r.status]}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
