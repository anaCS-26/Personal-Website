import { ArrowUpRightIcon } from "@/components/icons";
import type { Project } from "@/lib/content";

const BUTTON =
  "inline-flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors";

/** Compact project summary shown under a chat reply that links the project. */
export function ProjectCard({ p }: { p: Project }) {
  const live = p.demo ?? p.site;
  return (
    <article
      aria-label={p.name}
      className="animate-enter rounded-xl border border-line bg-bg-elevated/90 p-4 shadow-[0_1px_2px_var(--shadow)]"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg leading-tight tracking-tight">{p.name}</h3>
        {(p.flagship || p.upcoming) && (
          <span className="shrink-0 text-xs text-fg-faint">
            {p.upcoming ? "Coming soon" : "Flagship"}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-fg-muted">{p.pitch}</p>
      <p className="mt-2 text-xs text-fg-faint">{p.stack.slice(0, 4).join(" · ")}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <a
          href={`/projects#${p.slug}`}
          className={`${BUTTON} border border-line-strong hover:bg-surface`}
        >
          Details
        </a>
        {p.github && (
          <a
            href={p.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON} border border-line-strong hover:bg-surface`}
          >
            Source
            <ArrowUpRightIcon size={11} />
          </a>
        )}
        {live && (
          <a
            href={live}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON} bg-fg text-bg hover:opacity-85`}
          >
            {p.demo ? "Live demo" : new URL(live).hostname}
            <ArrowUpRightIcon size={11} />
          </a>
        )}
      </div>
    </article>
  );
}
