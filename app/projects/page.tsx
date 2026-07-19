import { PageShell } from "@/components/PageShell";
import { projects } from "@/lib/content";

export const metadata = { title: "Projects · Asad Ansari" };

export default function ProjectsPage() {
  return (
    <PageShell
      eyebrow="projects"
      title="Things I've shipped"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((p) => (
          <article
            key={p.slug}
            id={p.slug}
            className={`group flex scroll-mt-24 flex-col rounded-2xl border border-line bg-bg-elevated p-6 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface ${
              p.flagship ? "md:col-span-2" : ""
            }`}
          >
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-2xl">{p.name}</h2>
              {p.flagship && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                  flagship
                </span>
              )}
            </div>
            <p className="mt-2 text-fg-muted">{p.pitch}</p>
            <ul className="mt-4 space-y-2 text-sm text-fg-muted">
              {p.bullets.map((b, i) => (
                <li key={i} className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent"
                  />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <span
                  key={s}
                  className="rounded border border-line px-2 py-0.5 font-mono text-[11px] text-fg-faint"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-5 flex gap-5 border-t border-line pt-4 text-sm">
              <a
                href={p.github}
                target="_blank"
                rel="noopener noreferrer"
                className="link-sweep text-accent"
              >
                GitHub ↗
              </a>
              {p.demo && (
                <a
                  href={p.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-sweep text-accent"
                >
                  Live demo ↗
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
