import clsx from "clsx";
import { claims, type Claim } from "@/lib/blueprint";

// The app Architect "built": a claims queue. Uses its own fixed light palette,
// because it is the customer's app, not Architect's UI.

const riskStyle: Record<Claim["risk"], string> = {
  low: "bg-[#e6f4ea] text-[#1e7a3c]",
  medium: "bg-[#fdf1dc] text-[#9a5a00]",
  high: "bg-[#fde7e7] text-[#b42424]",
};

export function MockClaimsApp({ compact = false, highlight }: { compact?: boolean; highlight?: boolean }) {
  const rows = compact ? claims.slice(0, 4) : claims;
  return (
    <div className="h-full overflow-hidden rounded-md bg-[#f7f8fa] text-[#131722]" style={{ colorScheme: "light" }}>
      <div className="flex items-center gap-3 border-b border-[#e3e6eb] bg-white px-4 py-2.5">
        <span className="grid size-6 place-items-center rounded bg-[#0f5c4d] text-[11px] font-bold text-white">CT</span>
        <span className="text-sm font-semibold">Claims Triage</span>
        {!compact && (
          <nav className="ml-4 hidden gap-4 text-xs text-[#5b6272] sm:flex">
            <span className="font-medium text-[#131722]">My queue</span>
            <span>Investigations</span>
            <span>Dashboard</span>
          </nav>
        )}
        <span className="ml-auto text-xs text-[#5b6272]">R. Iyer</span>
      </div>

      <div className="grid gap-3 p-4">
        {!compact && (
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Routed today", "63"],
              ["Avg. time to route", "3m 40s"],
              ["Sent to investigations", "5"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border border-[#e3e6eb] bg-white p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-[#5b6272]">{k}</div>
                <div className="text-lg font-semibold tabular-nums">{v}</div>
              </div>
            ))}
          </div>
        )}

        <div className={clsx("overflow-hidden rounded-md border bg-white", highlight ? "border-[#3355f0] ring-2 ring-[#3355f0]/30" : "border-[#e3e6eb]")}>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f2f4f7] text-[10px] uppercase tracking-wide text-[#5b6272]">
              <tr>
                <th className="px-3 py-2 font-medium">Claim</th>
                <th className="px-3 py-2 font-medium">Type</th>
                {!compact && <th className="px-3 py-2 text-right font-medium">Amount</th>}
                <th className="px-3 py-2 font-medium">Risk</th>
                {!compact && <th className="px-3 py-2 font-medium">Coverage</th>}
                {!compact && <th className="px-3 py-2 font-medium">Assigned</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-[#eef0f3]">
                  <td className="px-3 py-2">
                    <div className="font-medium">{c.customer}</div>
                    <div className="font-mono text-[10px] text-[#8a91a0]">{c.id} · {c.received}</div>
                  </td>
                  <td className="px-3 py-2 text-[#3d4452]">{c.type}</td>
                  {!compact && <td className="px-3 py-2 text-right tabular-nums">${c.amount.toLocaleString("en-US")}</td>}
                  <td className="px-3 py-2">
                    <span className={clsx("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", riskStyle[c.risk])}>{c.risk}</span>
                  </td>
                  {!compact && <td className="px-3 py-2 text-[#3d4452]">{c.coverage}</td>}
                  {!compact && <td className="px-3 py-2 text-[#3d4452]">{c.assignee}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
