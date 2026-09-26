import { BuildView } from "@/components/build-view";

export default async function BuildPage({ searchParams }: PageProps<"/p/[id]">) {
  const { build } = await searchParams;
  return <BuildView autoBuild={build === "1"} />;
}
