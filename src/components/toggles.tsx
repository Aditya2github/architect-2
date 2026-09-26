"use client";

import clsx from "clsx";
import { Code2, Moon, Sparkles, Sun } from "lucide-react";
import { usePrefs, type Lens } from "@/components/providers";

const lenses: { value: Lens; label: string; icon: typeof Sparkles; hint: string }[] = [
  { value: "simple", label: "Simple", icon: Sparkles, hint: "Outcomes and plain language" },
  { value: "pro", label: "Pro", icon: Code2, hint: "Code, diffs, traces and config" },
];

/** Switches how the whole product is presented. Same project, two lenses. */
export function LensToggle({ className }: { className?: string }) {
  const { lens, setLens } = usePrefs();
  return (
    <div role="radiogroup" aria-label="View" className={clsx("flex rounded-md border border-line bg-surface-2 p-0.5", className)}>
      {lenses.map(({ value, label, icon: Icon, hint }) => (
        <button
          key={value}
          role="radio"
          aria-checked={lens === value}
          title={hint}
          onClick={() => setLens(value)}
          className={clsx(
            "flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors",
            lens === value ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = usePrefs();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

/** Renders children only in the matching lens. */
export function OnlyIn({ lens, children }: { lens: Lens; children: React.ReactNode }) {
  const prefs = usePrefs();
  return prefs.lens === lens ? <>{children}</> : null;
}
