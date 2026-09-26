"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Bot, Paperclip, Palette, Plug } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { starters } from "@/lib/demo";
import { createProject } from "@/app/actions";

/** The home prompt box. Submitting always goes to the plan step first, never straight to a build. */
export function Composer() {
  const router = useRouter();
  const { lens } = usePrefs();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Signed-in users get the project saved to their account first; demo visitors skip straight to the plan.
  const submit = async () => {
    const prompt = value.trim();
    if (!prompt || saving) return;
    setSaving(true);
    const { id } = await createProject(prompt).catch(() => ({ id: "new" }));
    router.push(`/p/${id}/plan?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-line bg-surface shadow-sm focus-within:border-accent">
        <label htmlFor="home-prompt" className="sr-only">Describe what you want to build</label>
        <textarea
          id="home-prompt"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={3}
          placeholder={
            lens === "pro"
              ? "Describe the agent, or paste a spec. e.g. LangGraph agent that triages claims from S3, Postgres for state…"
              : "Describe the work you want an agent to do. e.g. Read new insurance claims and flag the suspicious ones…"
          }
          className="w-full resize-none bg-transparent px-4 pt-4 text-[15px] leading-relaxed outline-none placeholder:text-faint"
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          {[
            { icon: Paperclip, label: "Attach files" },
            { icon: Palette, label: "Theme" },
            { icon: Plug, label: "Tools" },
            { icon: Bot, label: "Add existing agent" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} title={label} className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-surface-2 hover:text-ink">
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          <button
            onClick={submit}
            disabled={!value.trim() || saving}
            aria-label="Plan it"
            className="ml-auto flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-accent-ink hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Plan it"} <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {starters.map((s) => (
          <button key={s} onClick={() => setValue(s)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted hover:border-line-strong hover:text-ink">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
