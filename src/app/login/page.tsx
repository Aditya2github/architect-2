import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { SignInPanel } from "@/components/sign-in-panel";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getCurrentUser()) redirect("/home");
  const { error } = await searchParams;

  return (
    <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-6 py-6 sm:px-12">
        <Logo />
        <div className="mx-auto grid w-full max-w-sm flex-1 content-center gap-6 py-12">
          <div className="grid gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to Architect</h1>
            <p className="text-sm text-muted">New here? The same buttons create your account.</p>
          </div>
          <SignInPanel failure={typeof error === "string" ? error : null} />
          <p className="text-xs leading-relaxed text-faint">
            Enterprise workspace? Sign in with SSO from your company&apos;s identity provider. Your prompts and data are never used to train models.
          </p>
        </div>
      </div>

      <aside className="blueprint relative hidden overflow-hidden border-l border-line bg-surface lg:grid lg:content-center lg:p-14">
        <div className="grid max-w-md gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">What you get in 10 minutes</p>
          <ol className="grid gap-4">
            {[
              ["A plan you approve", "PRD, agent diagram and a cost estimate before anything runs."],
              ["Agents with a report card", "Each agent tested against simulated users and scored."],
              ["A live, shareable app", "Deployed to a URL once tests, security and evals pass."],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-4 rounded-lg border border-line bg-bg/70 p-4 backdrop-blur">
                <span className="font-mono text-sm text-accent">{i + 1}</span>
                <div className="grid gap-1">
                  <span className="font-medium">{title}</span>
                  <span className="text-sm text-muted">{body}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
