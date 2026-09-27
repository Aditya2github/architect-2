"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Activity, Bot, ChevronDown, ChevronLeft, Database, FileText, GitBranch, Hammer, Rocket, Settings2, Share2,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { LensToggle, ThemeToggle } from "@/components/toggles";
import { CreditMeter } from "@/components/workspace-shell";
import { AccountMenu, type Viewer } from "@/components/account-menu";
import { StatusPill } from "@/components/ui";
import type { Project } from "@/lib/demo";
import { useProjectPlan } from "@/lib/use-plan";
import { useState } from "react";
import { ShareDialog } from "@/components/share-dialog";

const envs = [
  { id: "preview", dot: "bg-accent", note: "Safe to experiment. Uses sample data." },
  { id: "staging", dot: "bg-warn", note: "Last tested version, real integrations in test mode." },
  { id: "production", dot: "bg-good", note: "What your users see. Changes need approval." },
] as const;

const sections = [
  { slug: "", label: "Build", icon: Hammer },
  { slug: "/plan", label: "Plan", icon: FileText },
  { slug: "/agents", label: "Agents", icon: Bot },
  { slug: "/data", label: "Data", icon: Database },
  { slug: "/git", label: "GitHub", icon: GitBranch },
  { slug: "/deploy", label: "Deploy", icon: Rocket },
  { slug: "/monitor", label: "Monitor", icon: Activity },
  { slug: "/settings", label: "Settings", icon: Settings2 },
];

export function ProjectShell({ project, viewer, children }: { project: Project; viewer: Viewer; children: React.ReactNode }) {
  const pathname = usePathname();
  const base = `/p/${project.id}`;
  const plan = useProjectPlan(project.id);
  const name = project.id === "new" && plan ? plan.title : project.name;
  const [env, setEnv] = useState<(typeof envs)[number]["id"]>("preview");
  const [envOpen, setEnvOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const envInfo = envs.find((e) => e.id === env)!;

  return (
    <div className="flex h-dvh w-full max-w-full flex-col overflow-x-hidden">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-3 sm:gap-3">
        <Link href="/home" className="flex items-center gap-1 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-ink" aria-label="Back to home">
          <ChevronLeft className="size-4" />
          <LogoMark size={20} />
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold">{name}</span>
          <span className="hidden sm:inline-flex"><StatusPill status={project.status} /></span>
        </div>
        <div className="relative hidden lg:block">
          <button onClick={() => setEnvOpen((o) => !o)} aria-expanded={envOpen} className="flex h-7 items-center gap-1.5 rounded-md border border-line px-2 font-mono text-xs text-muted hover:border-line-strong" title="Environment">
            <span className={clsx("size-1.5 rounded-full", envInfo.dot)} /> {env} <ChevronDown className="size-3" />
          </button>
          {envOpen && (
            <div className="absolute left-0 top-9 z-40 grid w-72 gap-1 rounded-lg border border-line bg-surface p-1.5 shadow-xl">
              {envs.map((e) => (
                <button key={e.id} onClick={() => { setEnv(e.id); setEnvOpen(false); }} className={clsx("grid gap-0.5 rounded-md px-2.5 py-2 text-left", env === e.id ? "bg-surface-2" : "hover:bg-surface-2")}>
                  <span className="flex items-center gap-2 font-mono text-xs"><span className={clsx("size-1.5 rounded-full", e.dot)} />{e.id}</span>
                  <span className="text-xs text-muted">{e.note}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <CreditMeter />
          <LensToggle className="hidden sm:flex" />
          <ThemeToggle />
          <button onClick={() => setShareOpen(true)} className="hidden h-8 items-center gap-1.5 rounded-md px-3 text-sm text-muted hover:bg-surface-2 hover:text-ink sm:flex">
            <Share2 className="size-4" /> Share
          </button>
          <Link href={`${base}/deploy`} className="flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-medium text-accent-ink hover:opacity-90">
            <Rocket className="size-4" /> <span className="hidden sm:inline">{project.status === "live" ? "Update" : "Go live"}</span>
          </Link>
          <AccountMenu viewer={viewer} />
        </div>
      </header>
      {env === "production" && (
        <div className="shrink-0 border-b border-good/30 bg-good-soft px-4 py-1.5 text-center text-xs text-good">
          You are looking at production. Agents act on real data here, and every change goes through approval.
        </div>
      )}
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} projectName={name} projectId={project.id} />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <nav aria-label="Project" className="flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-surface p-2 md:w-[76px] md:flex-col md:border-r md:border-b-0">
          {sections.map(({ slug, label, icon: Icon }) => {
            const href = base + slug;
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={clsx(
                  "flex shrink-0 flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] md:px-0",
                  active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                <Icon className="size-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function ProjectPage({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 md:px-8">{children}</div>;
}
