import Link from "next/link";
import { Compass, FolderGit2, LayoutTemplate, MessageSquareText } from "lucide-react";
import { Composer } from "@/components/composer";
import { StatusPill } from "@/components/ui";
import { projects, user, type Project } from "@/lib/demo";
import { listMyProjects } from "@/lib/projects";
import { getViewer } from "@/lib/viewer";

const startingPoints = [
  { icon: MessageSquareText, title: "Describe an idea", body: "Type it above. You'll approve a plan before anything is built.", href: "#new" },
  { icon: LayoutTemplate, title: "Start from a blueprint", body: "Proven agent apps for claims, sales, support, HR and more.", href: "/blueprints" },
  { icon: Compass, title: "Help me decide", body: "Answer three questions and get three agents that would save you the most time.", href: "/decide" },
  { icon: FolderGit2, title: "Import a project", body: "Bring a GitHub repo in any stack and keep building here.", href: "/p/new/import" },
];

export default async function HomePage() {
  const [viewer, mine] = await Promise.all([getViewer(), listMyProjects()]);
  const firstName = viewer ? viewer.name.split(" ")[0] : user.name;
  return (
    <div className="grid gap-12">
      <section id="new" className="grid gap-5 scroll-mt-20">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">What should we build today, {firstName}?</h1>
        <Composer />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {startingPoints.map(({ icon: Icon, title, body, href }) => (
          <Link key={title} href={href} className="grid content-start gap-2 rounded-lg border border-line bg-surface p-4 hover:border-line-strong">
            <Icon className="size-5 text-accent" />
            <span className="font-medium">{title}</span>
            <span className="text-sm text-muted">{body}</span>
          </Link>
        ))}
      </section>

      {mine.length > 0 && <ProjectGrid title="Your projects" items={mine} planFirst />}
      <ProjectGrid title={mine.length > 0 ? "Example projects" : "Your projects"} items={projects} />
    </div>
  );
}

function ProjectGrid({ title, items, planFirst = false }: { title: string; items: Project[]; planFirst?: boolean }) {
  return (
    <section className="grid gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-faint">{items.length} {items.length === 1 ? "project" : "projects"}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((p) => (
          <Link key={p.id} href={planFirst ? `/p/${p.id}/plan?prompt=${encodeURIComponent(p.summary)}` : `/p/${p.id}`} className="grid gap-3 rounded-lg border border-line bg-surface p-4 hover:border-line-strong">
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium">{p.name}</span>
              <StatusPill status={p.status} />
            </div>
            <p className="line-clamp-2 text-sm text-muted">{p.summary}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
              {p.agents > 0 && <span>{p.agents} agents</span>}
              <span>{p.framework}</span>
              {p.evalScore && <span className="text-good">Eval {p.evalScore}/100</span>}
              <span className="ml-auto">Edited {p.updated}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
