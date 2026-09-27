"use client";

import { useState } from "react";
import { Check, Copy, Globe, Lock, Users } from "lucide-react";
import { Dialog } from "@/components/dialog";
import { Button } from "@/components/ui";

const people = [
  { name: "Priya Nair", email: "priya@acme-insurance.com", role: "Can edit" },
  { name: "Rohan Iyer", email: "rohan@acme-insurance.com", role: "Can view" },
];

export function ShareDialog({ open, onClose, projectName, projectId }: { open: boolean; onClose: () => void; projectName: string; projectId: string }) {
  const [email, setEmail] = useState("");
  const [invited, setInvited] = useState<string[]>([]);
  const [access, setAccess] = useState("company");
  const [copied, setCopied] = useState(false);
  const link = `https://architect-2-mauve.vercel.app/p/${projectId}`;

  return (
    <Dialog open={open} onClose={onClose} title={`Share ${projectName}`} description="Invite people to build with you, or share a read-only link to the preview.">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const v = email.trim();
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
            setInvited((i) => [...i, v]);
            setEmail("");
          }
        }}
      >
        <label htmlFor="share-email" className="sr-only">Email address</label>
        <input id="share-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="h-9 flex-1 rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-accent" />
        <select id="share-role" aria-label="Role" className="h-9 rounded-md border border-line bg-bg px-2 text-sm">
          <option>Can edit</option>
          <option>Can view</option>
        </select>
        <Button type="submit" variant="primary">Invite</Button>
      </form>

      <div className="grid gap-1">
        {[...people, ...invited.map((e) => ({ name: e.split("@")[0], email: e, role: "Invite sent" }))].map((p) => (
          <div key={p.email} className="flex items-center gap-3 rounded-md px-1 py-1.5 text-sm">
            <span className="grid size-7 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">{p.name[0].toUpperCase()}</span>
            <span className="grid flex-1"><span>{p.name}</span><span className="text-xs text-muted">{p.email}</span></span>
            <span className={p.role === "Invite sent" ? "flex items-center gap-1 text-xs text-good" : "text-xs text-muted"}>{p.role === "Invite sent" && <Check className="size-3.5" />}{p.role}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-2 border-t border-line pt-4">
        <label htmlFor="share-access" className="text-sm font-medium">Preview link</label>
        <div className="flex items-center gap-2">
          {access === "anyone" ? <Globe className="size-4 text-warn" /> : access === "company" ? <Users className="size-4 text-accent" /> : <Lock className="size-4 text-muted" />}
          <select id="share-access" value={access} onChange={(e) => setAccess(e.target.value)} className="h-9 flex-1 rounded-md border border-line bg-bg px-2 text-sm">
            <option value="invited">Only people invited</option>
            <option value="company">Anyone at acme-insurance.com</option>
            <option value="anyone">Anyone with the link</option>
          </select>
          <Button
            onClick={() => {
              navigator.clipboard?.writeText(link).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
        {access === "anyone" && <p className="text-xs text-warn">Anyone with the link can use the preview. Agents still run with your credentials, so keep spending caps on.</p>}
      </div>
    </Dialog>
  );
}
