import { LensToggle, ThemeToggle } from "@/components/toggles";
import { Button, PageHeader } from "@/components/ui";
import { user } from "@/lib/demo";

const accounts = [
  ["GitHub", "Connected as aditya", true],
  ["Google Workspace", "Connected", true],
  ["Slack", "Not connected", false],
] as const;

export default function SettingsPage() {
  return (
    <div className="grid max-w-3xl gap-8">
      <PageHeader title="Settings" description="Your profile, connected accounts and workspace defaults." />

      <section className="grid gap-4">
        <h2 className="font-semibold">Profile</h2>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">Name</span>
          <input id="profile-name" defaultValue={user.name} className="h-9 rounded-md border border-line bg-surface px-3" />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="grid"><span>Default view</span><span className="text-muted">Simple shows outcomes. Pro shows code, diffs and traces.</span></span>
          <LensToggle />
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span>Theme</span>
          <ThemeToggle />
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="font-semibold">Connected accounts</h2>
        {accounts.map(([name, status, on]) => (
          <div key={name} className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 text-sm">
            <span className="grid"><span>{name}</span><span className="text-xs text-muted">{status}</span></span>
            <Button size="sm">{on ? "Manage" : "Connect"}</Button>
          </div>
        ))}
      </section>

      <section className="grid gap-3 text-sm">
        <h2 className="font-semibold">Data &amp; models</h2>
        <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3">
          <span className="grid"><span>Keep run logs for</span><span className="text-xs text-muted">Traces and agent inputs are deleted after this.</span></span>
          <select id="retention" defaultValue="30 days" className="h-8 rounded-md border border-line bg-bg px-2">{["7 days", "30 days", "90 days", "1 year"].map((o) => <option key={o}>{o}</option>)}</select>
        </div>
        <p className="text-muted">Your prompts, files and data are never used to train models.</p>
      </section>
    </div>
  );
}
