import { PageShell } from "@/components/PageShell";
import { ProjectVisual } from "@/components/ProjectVisual";
import { ArrowUpRightIcon } from "@/components/icons";
import { projects } from "@/lib/content";

export const metadata = { title: "Projects · Asad Ansari" };

export default function ProjectsPage() {
  return (
    <PageShell
      title="Projects"
      intro="Selected work in computer vision, LLM systems, and full-stack development."
    >
      <div className="space-y-24">
        {projects.map((p, i) => (
          <article
            key={p.slug}
            id={p.slug}
            className="grid scroll-mt-24 items-start gap-8 md:grid-cols-2 md:gap-12"
          >
            <div className={`md:sticky md:top-24 ${i % 2 === 1 ? "md:order-2" : ""}`}>
              <ProjectVisual slug={p.slug} />
            </div>
            <div>
              <p className="text-sm tabular-nums text-fg-faint">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">{p.name}</h2>
              <p className="mt-3 text-[17px] leading-relaxed">{p.pitch}</p>
              <ul className="mt-5 list-disc space-y-2 pl-5 leading-relaxed text-fg-muted marker:text-fg-faint">
                {p.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-fg-faint">{p.stack.join(" · ")}</p>
              <div className="mt-6 flex flex-wrap gap-2.5 text-sm">
                <a
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-line-strong px-3 py-1.5 transition-colors hover:bg-surface"
                >
                  Source
                  <ArrowUpRightIcon size={13} />
                </a>
                {p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-fg px-3 py-1.5 text-bg transition-opacity hover:opacity-85"
                  >
                    Live demo
                    <ArrowUpRightIcon size={13} />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
