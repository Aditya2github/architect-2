"use client";

import { useSyncExternalStore } from "react";

// The look of the app Architect builds for the user (not Architect's own UI theme).

export type AppTheme = { id: string; name: string; accent: string; surface: string; ink: string; font: string; note: string };

export const appThemes: AppTheme[] = [
  { id: "harbor", name: "Harbor", accent: "#1f3a8a", surface: "#f7f8fa", ink: "#131722", font: "Inter-like sans", note: "Calm and trustworthy. Good for finance and insurance." },
  { id: "evergreen", name: "Evergreen", accent: "#0f5c4d", surface: "#f5f8f6", ink: "#10201b", font: "Humanist sans", note: "Quiet, operational. Good for internal tools." },
  { id: "graphite", name: "Graphite", accent: "#27272a", surface: "#fafafa", ink: "#18181b", font: "Neo-grotesk", note: "Neutral and dense. Good for data-heavy screens." },
  { id: "saffron", name: "Saffron", accent: "#b45309", surface: "#fffbf5", ink: "#1f1a14", font: "Friendly rounded sans", note: "Warm and approachable. Good for customer-facing apps." },
  { id: "orchid", name: "Orchid", accent: "#7e22ce", surface: "#faf7fd", ink: "#1b1325", font: "Geometric sans", note: "Bold and modern. Good for marketing tools." },
  { id: "signal", name: "Signal", accent: "#be123c", surface: "#fdf7f8", ink: "#1f1215", font: "Condensed sans", note: "Urgent and clear. Good for alerts and ops." },
];

const KEY = "architect.appTheme";
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "harbor";
  } catch {
    return "harbor";
  }
}

export function saveAppTheme(theme: AppTheme) {
  try {
    localStorage.setItem(KEY, theme.id);
    if (!appThemes.some((t) => t.id === theme.id)) localStorage.setItem(`${KEY}.custom`, JSON.stringify(theme));
  } catch {
    // Not persisted in private mode; the choice still applies until reload.
  }
  listeners.forEach((fn) => fn());
}

function customTheme(): AppTheme | null {
  try {
    const raw = localStorage.getItem(`${KEY}.custom`);
    return raw ? (JSON.parse(raw) as AppTheme) : null;
  } catch {
    return null;
  }
}

export function useAppTheme(): AppTheme {
  const id = useSyncExternalStore(subscribe, read, () => "harbor");
  return appThemes.find((t) => t.id === id) ?? (typeof window !== "undefined" ? customTheme() : null) ?? appThemes[0];
}
