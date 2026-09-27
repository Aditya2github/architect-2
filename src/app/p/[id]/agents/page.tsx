import { AgentsView } from "@/components/agents-view";

export default async function Page({ params }: PageProps<"/p/[id]/agents">) {
  const { id } = await params;
  return <AgentsView projectId={id} />;
}
