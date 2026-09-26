import { ProjectShell } from "@/components/project-shell";
import { loadProject } from "@/lib/projects";
import { getViewer } from "@/lib/viewer";

export default async function ProjectLayout({ children, params }: LayoutProps<"/p/[id]">) {
  const { id } = await params;
  const [project, viewer] = await Promise.all([loadProject(id), getViewer()]);
  return <ProjectShell project={project} viewer={viewer}>{children}</ProjectShell>;
}
