import { ProjectShell } from "@/components/project-shell";
import { getProject } from "@/lib/demo";

export default async function ProjectLayout({ children, params }: LayoutProps<"/p/[id]">) {
  const { id } = await params;
  return <ProjectShell project={getProject(id)}>{children}</ProjectShell>;
}
