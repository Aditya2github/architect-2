"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

/** Minimal accessible modal: Escape and backdrop close it, focus moves inside on open. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const focusable = panel.current?.querySelector<HTMLElement>("input, textarea, select, button:not([data-close])");
    focusable?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-start justify-items-center overflow-y-auto bg-black/40 px-4 pt-[10vh] pb-8 backdrop-blur-[2px]" onMouseDown={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={clsx("grid w-full gap-4 rounded-xl border border-line bg-surface p-5 shadow-2xl", size === "sm" && "max-w-md", size === "md" && "max-w-xl", size === "lg" && "max-w-3xl")}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
          <button data-close onClick={onClose} aria-label="Close" className="grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
