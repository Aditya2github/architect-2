import { getServerSupabase } from "@/lib/supabase/server";
import { getProject, type Project } from "@/lib/demo";

type Row = { id: string; name: string; prompt: string | null; created_at: string };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toProject(row: Row): Project {
  return {
    id: row.id,
    name: row.name,
    summary: row.prompt ?? "",
    status: "draft",
    agents: 0,
    updated: new Date(row.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    framework: "Not chosen yet",
  };
}

/** Projects the signed-in user created, newest first. Empty for demo visitors. */
export async function listMyProjects(): Promise<Project[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("projects").select("id, name, prompt, created_at").order("created_at", { ascending: false }).limit(20);
  return (data ?? []).map(toProject);
}

/** A saved project by id (RLS guarantees it belongs to the viewer), else the demo project. */
export async function loadProject(id: string): Promise<Project> {
  if (uuid.test(id)) {
    const supabase = await getServerSupabase();
    const { data } = (await supabase?.from("projects").select("id, name, prompt, created_at").eq("id", id).maybeSingle()) ?? { data: null };
    if (data) return toProject(data as Row);
  }
  return getProject(id);
}
