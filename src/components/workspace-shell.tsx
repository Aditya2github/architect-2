"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BookOpen, Gauge, Home, LayoutTemplate, Plus, Search, Settings, Terminal, Users } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { LensToggle, ThemeToggle } from "@/components/toggles";
import { projects, user } from "@/lib/demo";
import { Kbd } from "@/components/ui";
import { AccountMenu, type Viewer } from "@/components/account-menu";
import { openPalette } from "@/components/command-palette";

const nav = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/blueprints", label: "Blueprints", icon: LayoutTemplate },
  { href: "/usage", label: "Usage & billing", icon: Gauge },
  { href: "/team", label: "Team", icon: Users },
  { href: "/developers", label: "Developers", icon: Terminal },
  { href: "/settings", label: "Settings", icon: Settings },
];

const dot = { live: "bg-good", building: "bg-accent", draft: "bg-faint" } as const;

export function CreditMeter() {
  const pct = Math.round((user.credits / user.creditCap) * 100);
  return (
    <Link href="/usage" className="hidden items-center gap-2 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-2 sm:flex" title="Credits left this month">
      <span className="font-mono tabular-nums text-ink">${user.credits.toFixed(2)}</span>
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-line">
        <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </span>
    </Link>
  );
}

export function WorkspaceShell({ viewer, children }: { viewer: Viewer; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="flex items-center gap-2 px-4 py-4">
          <LogoMark />
          <span className="truncate text-sm font-semibold">{viewer ? `${viewer.name.split(" ")[0]}'s workspace` : user.workspace}</span>
        </div>

        <div className="px-3">
          <Link href="/home#new" className="flex h-9 items-center justify-center gap-2 rounded-md bg-accent text-sm font-medium text-accent-ink hover:opacity-90">
            <Plus className="size-4" /> New project
          </Link>
        </div>

        <nav className="mt-4 grid gap-0.5 px-2">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm",
                pathname === href ? "bg-surface-2 font-medium text-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 px-4 font-mono text-[11px] uppercase tracking-wider text-faint">Projects</div>
        <div className="mt-2 grid gap-0.5 overflow-y-auto px-2">
          {projects.map((p) => (
            <Link key={p.id} href={`/p/${p.id}`} className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted hover:bg-surface-2 hover:text-ink">
              <span className={clsx("size-1.5 shrink-0 rounded-full", dot[p.status])} />
              <span className="truncate">{p.name}</span>
            </Link>
          ))}
        </div>

        <a href="https://docs.architect.new" target="_blank" rel="noreferrer" className="mt-auto flex items-center gap-2 border-t border-line px-4 py-3 text-sm text-muted hover:text-ink">
          <BookOpen className="size-4" /> Docs & guides
        </a>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur md:px-6">
          <span className="md:hidden"><LogoMark /></span>
          <button onClick={openPalette} className="flex h-8 w-full max-w-xs items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-sm text-faint hover:border-line-strong">
            <Search className="size-4" />
            <span className="flex-1 text-left">Search or jump to…</span>
            <Kbd>Ctrl K</Kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <CreditMeter />
            <LensToggle />
            <ThemeToggle />
            <AccountMenu viewer={viewer} />
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 md:hidden">
          {nav.map(({ href, label }) => (
            <Link key={href} href={href} className={clsx("shrink-0 rounded-md px-3 py-1.5 text-sm", pathname === href ? "bg-surface-2 text-ink" : "text-muted")}>
              {label}
            </Link>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
