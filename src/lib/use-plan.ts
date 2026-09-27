"use client";

import { useMemo, useSyncExternalStore } from "react";
import { claimsPlan, type Plan } from "@/lib/plan";

// Plans are kept per project in the browser so Build and Agents can show the user's own app.
const key = (projectId: string) => `architect.plan.${projectId}`;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function read(projectId: string): string | null {
  try {
    return localStorage.getItem(key(projectId));
  } catch {
    return null;
  }
}

export function savePlan(projectId: string, plan: Plan) {
  try {
    localStorage.setItem(key(projectId), JSON.stringify(plan));
  } catch {
    // Storage unavailable: the plan still shows on this screen, it just won't carry over.
  }
  listeners.forEach((fn) => fn());
}

/** The project's saved plan, the demo plan for seeded projects, or null. */
export function useProjectPlan(projectId: string): Plan | null {
  const raw = useSyncExternalStore(subscribe, () => read(projectId), () => null);
  const parsed = useMemo((): Plan | null => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Plan;
    } catch {
      return null;
    }
  }, [raw]);
  return parsed ?? (projectId === "claims-triage" ? claimsPlan : null);
}
