import Link from "next/link";
import { AvatarMark } from "@/components/AvatarMark";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { identity, projects } from "@/lib/content";

function CardShell({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border border-line bg-bg-elevated/80 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface focus-visible:border-accent ${className}`}
    >
      {children}
    </Link>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl transition-colors group-hover:text-accent">
      {children}
    </h2>
  );
}

export function NavCards() {
  return (
    <nav
      aria-label="Explore the site"
      className="mx-auto grid w-full max-w-4xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {/* column 1: About + Experience */}
      <div className="grid gap-4">
        <CardShell href="/about">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>About</CardTitle>
              <p className="mt-1 text-sm text-fg-muted">A bit about myself.</p>
            </div>
            <AvatarMark size={44} />
          </div>
        </CardShell>
        <CardShell href="/experience" className="flex-1">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="mb-3 text-fg-faint transition-colors group-hover:text-accent"
          >
            <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <CardTitle>Experience</CardTitle>
          <p className="mt-1 text-sm text-fg-muted">
            Brookfield Renewable, Enbridge, and Carleton.
          </p>
        </CardShell>
      </div>

      {/* column 2: Projects (tall) */}
      <CardShell href="/projects">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="mb-3 text-fg-faint transition-colors group-hover:text-accent"
        >
          <path
            d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
        <CardTitle>Projects</CardTitle>
        <p className="mt-1 text-sm text-fg-muted">Things I&apos;ve actually shipped.</p>
        <ul className="mt-4 space-y-2.5">
          {projects.map((p) => (
            <li
              key={p.slug}
              className="rounded-lg border border-line px-3 py-2 transition-colors group-hover:border-line-strong"
            >
              <p className="text-sm font-medium">{p.name}</p>
              <p className="font-mono text-[10px] text-fg-faint">
                {p.stack.slice(0, 3).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </CardShell>

      {/* column 3: Contact (tall) */}
      <CardShell href="/contact" className="sm:col-span-2 lg:col-span-1">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="mb-3 text-fg-faint transition-colors group-hover:text-accent"
        >
          <path
            d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <CardTitle>Contact</CardTitle>
        <p className="mt-1 text-sm text-fg-muted">Email, GitHub, LinkedIn…</p>
        <div className="mt-4 flex gap-3 text-fg-faint transition-colors group-hover:text-fg-muted">
          <GitHubIcon size={18} />
          <LinkedInIcon size={18} />
        </div>
        <p className="mt-auto pt-6 font-mono text-[11px] text-fg-faint">
          {identity.status}
        </p>
      </CardShell>
    </nav>
  );
}
