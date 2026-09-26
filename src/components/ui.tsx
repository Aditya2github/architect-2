import Link from "next/link";
import clsx from "clsx";
import type { ProjectStatus } from "@/lib/demo";

type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:opacity-90",
  secondary: "bg-surface border border-line text-ink hover:border-line-strong hover:bg-surface-2",
  ghost: "text-muted hover:text-ink hover:bg-surface-2",
};

const buttonSizes = {
  sm: "h-8 px-3",
  md: "h-9 px-4",
  lg: "h-11 px-5 text-[15px]",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: keyof typeof buttonSizes;
};

export function Button({ variant = "secondary", size = "md", className, ...props }: ButtonProps) {
  return <button className={clsx(buttonBase, buttonVariants[variant], buttonSizes[size], className)} {...props} />;
}

type LinkButtonProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: keyof typeof buttonSizes;
};

export function LinkButton({ variant = "secondary", size = "md", className, ...props }: LinkButtonProps) {
  return <Link className={clsx(buttonBase, buttonVariants[variant], buttonSizes[size], className)} {...props} />;
}

const statusStyles: Record<ProjectStatus, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-good-soft text-good" },
  building: { label: "Building", className: "bg-accent-soft text-accent" },
  draft: { label: "Draft", className: "bg-surface-2 text-muted" },
};

export function StatusPill({ status }: { status: ProjectStatus }) {
  const s = statusStyles[status];
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", s.className)}>
      <span className={clsx("size-1.5 rounded-full bg-current", status === "building" && "animate-pulse")} />
      {s.label}
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-muted">
      {children}
    </kbd>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Placeholder for screens that are routed but not built yet. */
export function Planned({ items }: { items: string[] }) {
  return (
    <div className="blueprint rounded-lg border border-dashed border-line-strong p-6">
      <p className="mb-3 font-mono text-xs uppercase tracking-wider text-faint">Planned for this screen</p>
      <ul className="grid gap-2 text-sm text-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-accent">+</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
