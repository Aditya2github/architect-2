import { BuildView } from "@/components/build-view";
import { loadProject } from "@/lib/projects";

export default async function BuildPage({ params, searchParams }: PageProps<"/p/[id]">) {
  const { id } = await params;
  const { build } = await searchParams;
  const project = await loadProject(id);
  return <BuildView key={`${id}-${build ?? ""}`} projectId={id} projectName={project.name} autoBuild={build === "1"} />;
}
