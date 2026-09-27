"use client";

import Link from "next/link";
import { Compass, FileSpreadsheet, FolderGit2, LayoutTemplate } from "lucide-react";
import { openAttach } from "@/components/composer";

const card = "grid content-start gap-2 rounded-lg border border-line bg-surface p-4 text-left hover:border-line-strong";

export function StartingPoints() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Other ways to start">
      <button onClick={openAttach} className={`${card} border-good/40`}>
        <FileSpreadsheet className="size-5 text-good" />
        <span className="font-medium">Start from your data</span>
        <span className="text-sm text-muted">Drop a spreadsheet you already work in. Architect reads its columns and proposes agents for it.</span>
      </button>
      <Link href="/blueprints" className={card}>
        <LayoutTemplate className="size-5 text-accent" />
        <span className="font-medium">Start from a blueprint</span>
        <span className="text-sm text-muted">Proven agent apps for claims, KYC, support, sales and HR, each with its eval score.</span>
      </Link>
      <Link href="/p/new/import" className={card}>
        <FolderGit2 className="size-5 text-accent" />
        <span className="font-medium">Import a project</span>
        <span className="text-sm text-muted">Bring a GitHub repo in any stack and keep building here, agents included.</span>
      </Link>
      <button onClick={() => window.dispatchEvent(new Event("architect:tour"))} className={card}>
        <Compass className="size-5 text-accent" />
        <span className="font-medium">Take the 2-minute tour</span>
        <span className="text-sm text-muted">See what makes Architect different: signed plans, agent report cards and safe deploys.</span>
      </button>
    </section>
  );
}
