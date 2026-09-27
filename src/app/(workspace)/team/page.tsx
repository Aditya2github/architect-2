import { Plus } from "lucide-react";
import { Button, PageHeader } from "@/components/ui";

const members = [
  { name: "Aditya", email: "aditya@acme-insurance.com", role: "Owner", last: "Now" },
  { name: "Priya Nair", email: "priya@acme-insurance.com", role: "Admin", last: "1 h ago" },
  { name: "Rohan Iyer", email: "rohan@acme-insurance.com", role: "Builder", last: "Yesterday" },
  { name: "Sara Kapoor", email: "sara@acme-insurance.com", role: "Viewer", last: "3 days ago" },
];

const roles = [
  ["Viewer", "Opens apps and comments on the preview."],
  ["Builder", "Plans and builds. Can deploy to preview and staging."],
  ["Admin", "Everything a builder can do, plus approves production deploys and manages secrets."],
];

const audit = [
  ["Priya Nair", "approved production deploy c5", "Yesterday 18:02"],
  ["Aditya", "changed Fraud Scout model to Claude Opus 5", "Yesterday 17:40"],
  ["Rohan Iyer", "added secret OCR_API_KEY (production)", "Mon 10:15"],
];

export default function TeamPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="Team" description="Who can view, build and ship in this workspace." actions={<Button variant="primary" size="sm"><Plus className="size-3.5" /> Invite people</Button>} />

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs text-muted"><tr>{["Name", "Role", "Last active"].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.email} className="border-t border-line">
                <td className="px-4 py-2.5"><div className="grid"><span>{m.name}</span><span className="text-xs text-faint">{m.email}</span></div></td>
                <td className="px-4 py-2.5">
                  <select aria-label={`Role for ${m.name}`} defaultValue={m.role} disabled={m.role === "Owner"} className="h-8 rounded-md border border-line bg-bg px-2 text-sm disabled:opacity-70">
                    {["Owner", "Admin", "Builder", "Viewer"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2.5 text-muted">{m.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {roles.map(([r, d]) => (
          <div key={r} className="grid gap-1 rounded-lg border border-line bg-surface p-4 text-sm">
            <span className="font-medium">{r}</span>
            <span className="text-muted">{d}</span>
          </div>
        ))}
      </section>

      <section className="grid gap-3">
        <h2 className="font-semibold">Audit log</h2>
        <div className="grid gap-1 text-sm">
          {audit.map(([who, what, when]) => (
            <div key={what} className="flex flex-wrap gap-x-2 border-b border-line py-2">
              <span className="font-medium">{who}</span>
              <span className="text-muted">{what}</span>
              <span className="ml-auto text-xs text-faint">{when}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
