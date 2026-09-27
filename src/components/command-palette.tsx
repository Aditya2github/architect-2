"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowRight, Command, CornerDownLeft, Search } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { projects } from "@/lib/demo";

type Item = { id: string; label: string; group: string; hint?: string; run: () => void };

export const openPalette = () => window.dispatchEvent(new Event("architect:palette"));

/** Ctrl/⌘ K anywhere: jump to any screen or run an action without the mouse. */
export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const { lens, setLens, theme, setTheme } = usePrefs();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("architect:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("architect:palette", onOpen);
    };
  }, []);

  const current = pathname.match(/^\/p\/([^/]+)/)?.[1];

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => router.push(href);
    const list: Item[] = [
      { id: "new", label: "Start a new project", group: "Actions", hint: "Home", run: go("/home#new") },
      { id: "lens", label: `Switch to ${lens === "pro" ? "Simple" : "Pro"} view`, group: "Actions", run: () => setLens(lens === "pro" ? "simple" : "pro") },
      { id: "theme", label: `Switch to ${theme === "dark" ? "light" : "dark"} theme`, group: "Actions", run: () => setTheme(theme === "dark" ? "light" : "dark") },
      { id: "tour", label: "Take the 2-minute tour", group: "Actions", run: () => window.dispatchEvent(new Event("architect:tour")) },
      { id: "suggest", label: "Suggest agents for my role", group: "Actions", run: go("/decide") },
      { id: "import", label: "Import a GitHub repo", group: "Actions", run: go("/p/new/import") },
    ];
    if (current) {
      for (const [slug, label] of [["", "Build"], ["/plan", "Plan"], ["/agents", "Agents"], ["/data", "Data"], ["/git", "GitHub"], ["/deploy", "Deploy"], ["/monitor", "Monitor"], ["/settings", "Project settings"]])
        list.push({ id: `sec${slug}`, label, group: "This project", run: go(`/p/${current}${slug}`) });
    }
    for (const p of projects) list.push({ id: `p-${p.id}`, label: p.name, group: "Projects", hint: p.status, run: go(`/p/${p.id}`) });
    for (const [href, label] of [["/home", "Home"], ["/blueprints", "Blueprints"], ["/usage", "Usage & billing"], ["/team", "Team"], ["/developers", "Developers: CLI, MCP, API keys"], ["/settings", "Settings"]])
      list.push({ id: href, label, group: "Go to", run: go(href) });
    return list;
  }, [router, lens, setLens, theme, setTheme, current]);

  const q = query.trim().toLowerCase();
  const rank = (i: Item) => (i.label.toLowerCase().startsWith(q) ? 0 : i.label.toLowerCase().includes(q) ? 1 : 2);
  const filtered = q ? items.filter((i) => rank(i) < 2 || i.group.toLowerCase().includes(q)).sort((a, b) => rank(a) - rank(b)) : items;
  const active = Math.min(index, Math.max(filtered.length - 1, 0));

  const choose = (item: Item | undefined) => {
    if (!item) return;
    setOpen(false);
    setQuery("");
    item.run();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-start justify-items-center bg-black/40 px-4 pt-[12vh]" onMouseDown={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search className="size-4 text-faint" />
          <input
            autoFocus
            id="palette-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIndex((i) => Math.min(i + 1, filtered.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)); }
              if (e.key === "Enter") { e.preventDefault(); choose(filtered[active]); }
            }}
            placeholder="Jump to a screen or run an action…"
            className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-faint">Esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
          {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted">Nothing matches &ldquo;{query}&rdquo;.</p>}
          {filtered.map((item, i) => {
            const header = i === 0 || filtered[i - 1].group !== item.group ? item.group : null;
            return (
              <div key={item.id}>
                {header && <p className="px-3 pt-2 pb-1 font-mono text-[11px] uppercase tracking-wider text-faint">{header}</p>}
                <button
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => choose(item)}
                  className={clsx("flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm", i === active ? "bg-accent-soft text-ink" : "text-muted")}
                >
                  <ArrowRight className={clsx("size-3.5", i === active ? "text-accent" : "text-faint")} />
                  <span className="flex-1">{item.label}</span>
                  {item.hint && <span className="text-xs capitalize text-faint">{item.hint}</span>}
                  {i === active && <CornerDownLeft className="size-3.5 text-faint" />}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 border-t border-line px-4 py-2 text-xs text-faint">
          <Command className="size-3.5" /> K opens this anywhere · ↑↓ to move · Enter to go
        </div>
      </div>
    </div>
  );
}
