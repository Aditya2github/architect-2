import type { Viewer } from "@/components/account-menu";
import { getCurrentUser } from "@/lib/supabase/server";

/** The signed-in user in the shape the UI needs, or null for demo visitors. */
export async function getViewer(): Promise<Viewer> {
  const user = await getCurrentUser();
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  const email = user.email ?? "";
  return {
    name: meta.full_name || meta.name || meta.user_name || email.split("@")[0] || "You",
    email,
    avatarUrl: meta.avatar_url ?? null,
  };
}
