import Link from "next/link";

/** Architect mark: a drafting square with corner ticks. */
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="2" fill="var(--accent)" />
      <path d="M9 15l3-6 3 6M10.2 12.8h3.6" stroke="var(--accent-ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 5h2M5 1v2M21 19h2M19 21v2" stroke="var(--faint)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <LogoMark />
      <span>Architect</span>
    </Link>
  );
}
