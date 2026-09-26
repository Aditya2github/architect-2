"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut, Settings } from "lucide-react";
import { signOut } from "@/app/actions";

export type Viewer = { name: string; email: string; avatarUrl: string | null } | null;

export function AccountMenu({ viewer }: { viewer: Viewer }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!viewer) {
    return (
      <Link href="/login" className="flex h-8 items-center gap-1.5 rounded-md border border-line px-3 text-sm hover:border-line-strong">
        <LogIn className="size-4" /> Sign in
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Account" aria-expanded={open} className="grid size-8 place-items-center overflow-hidden rounded-full bg-accent-soft text-xs font-semibold text-accent">
        {viewer.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={viewer.avatarUrl} alt="" className="size-full object-cover" />
        ) : (
          viewer.name[0]?.toUpperCase()
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-40 grid w-60 gap-1 rounded-lg border border-line bg-surface p-2 shadow-xl">
          <div className="grid px-2 py-1.5">
            <span className="truncate text-sm font-medium">{viewer.name}</span>
            <span className="truncate text-xs text-muted">{viewer.email}</span>
          </div>
          <Link href="/settings" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-ink">
            <Settings className="size-4" /> Settings
          </Link>
          <form action={signOut}>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-ink">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
