import { SpotlightLink } from "@/components/SpotlightLink";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { experience, identity, projects } from "@/lib/content";

function Card({
  href,
  title,
  description,
  className = "",
  children,
}: {
  href: string;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <SpotlightLink
      href={href}
      className={`flex flex-col rounded-xl border border-line bg-bg-elevated/90 p-5 shadow-[0_1px_2px_var(--shadow)] transition-colors hover:border-line-strong ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-[26px] leading-tight tracking-tight">{title}</h2>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="mt-2 shrink-0 text-fg-faint transition-all group-hover:translate-x-0.5 group-hover:text-fg"
        >
          <path
            d="M5 12h14m-6-6 6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="mt-1 text-sm text-fg-muted">{description}</p>
      {children}
    </SpotlightLink>
  );
}

export function NavCards() {
  return (
    <nav
      aria-label="Explore the site"
      className="mx-auto grid w-full max-w-4xl gap-3 px-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div className="grid gap-3">
        <Card
          href="/about"
          title="About"
          description="Background, education, and life outside work."
        />
        <Card
          href="/experience"
          title="Experience"
          description="Internships and teaching."
          className="flex-1"
        >
          <ul className="mt-4 space-y-1.5 text-sm">
            {experience.map((e) => (
              <li key={e.org} className="flex justify-between gap-3">
                <span>{e.org}</span>
                <span className="tabular-nums text-fg-faint">{e.years}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card href="/projects" title="Projects" description="Selected work in ML and software.">
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {projects.map((p) => (
            <li key={p.slug} className="py-2.5">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="mt-0.5 text-xs text-fg-faint">
                {p.upcoming ? "Coming soon" : p.stack.slice(0, 3).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card
        href="/contact"
        title="Contact"
        description="Open to AI/ML roles across Canada."
        className="sm:col-span-2 lg:col-span-1"
      >
        <p className="mt-4 break-all text-sm">{identity.email}</p>
        <p className="mt-1 text-sm text-fg-muted">Based in Ottawa, happy to relocate.</p>
        <div className="mt-auto flex gap-3 pt-6 text-fg-faint transition-colors group-hover:text-fg-muted">
          <GitHubIcon size={17} />
          <LinkedInIcon size={17} />
        </div>
      </Card>
    </nav>
  );
}
