import { WorkspaceShell } from "@/components/workspace-shell";
import { getViewer } from "@/lib/viewer";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell viewer={await getViewer()}>{children}</WorkspaceShell>;
}
