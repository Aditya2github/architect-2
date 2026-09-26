"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

export type Lens = "simple" | "pro";
export type Theme = "light" | "dark";

type Prefs = {
  lens: Lens;
  setLens: (lens: Lens) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const PrefsContext = createContext<Prefs | null>(null);

// Preferences live outside React (localStorage + the <html> data-theme attribute),
// so they are read through a tiny external store.
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const notify = () => listeners.forEach((fn) => fn());

function readLens(): Lens {
  try {
    return localStorage.getItem("architect.lens") === "pro" ? "pro" : "simple";
  } catch {
    return "simple";
  }
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); the preference just won't persist.
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const lens = useSyncExternalStore(subscribe, readLens, () => "simple" as const);
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as const);

  const setLens = useCallback((next: Lens) => {
    save("architect.lens", next);
    notify();
  }, []);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    save("architect.theme", next);
    notify();
  }, []);

  return (
    <PrefsContext.Provider value={{ lens, setLens, theme, setTheme }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside <Providers>");
  return ctx;
}
