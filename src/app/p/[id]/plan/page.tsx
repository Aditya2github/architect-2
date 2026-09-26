import { PlanView } from "@/components/plan-view";

export default async function PlanPage({ params, searchParams }: PageProps<"/p/[id]/plan">) {
  const { id } = await params;
  const { prompt } = await searchParams;
  return <PlanView projectId={id} idea={typeof prompt === "string" ? prompt : null} />;
}
