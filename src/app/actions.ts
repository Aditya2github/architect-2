"use server";

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

function titleFromPrompt(prompt: string) {
  const words = prompt
    .replace(/^(an?|the|build|create|make)\s+/i, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5);
  const title = words.join(" ");
  return title ? title[0].toUpperCase() + title.slice(1) : "Untitled project";
}

/** Saves a new project for the signed-in user. Demo visitors get the shared "new" project. */
export async function createProject(prompt: string): Promise<{ id: string }> {
  const clean = prompt.trim().slice(0, 4000);
  if (!clean) return { id: "new" };
  const supabase = await getServerSupabase();
  if (!supabase) return { id: "new" };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { id: "new" };

  const { data, error } = await supabase
    .from("projects")
    .insert({ name: titleFromPrompt(clean), prompt: clean })
    .select("id")
    .single();
  return { id: error || !data ? "new" : data.id };
}

const lenses = new Set(["simple", "pro"]);

export async function saveProfile(input: { lens: string; role: string | null; tools: string[] }) {
  const supabase = await getServerSupabase();
  if (!supabase) return;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase.from("profiles").upsert({
    id: auth.user.id,
    lens: lenses.has(input.lens) ? input.lens : "simple",
    role: input.role?.slice(0, 60) ?? null,
    tools: input.tools.slice(0, 20).map((t) => t.slice(0, 40)),
    updated_at: new Date().toISOString(),
  });
}

export async function signOut() {
  const supabase = await getServerSupabase();
  await supabase?.auth.signOut();
  redirect("/");
}
