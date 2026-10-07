import { PageShell } from "@/components/PageShell";
import { ProjectVisual } from "@/components/ProjectVisual";
import { ArrowUpRightIcon } from "@/components/icons";
import { projects, type Project } from "@/lib/content";

export const metadata = { title: "Projects · Asad Ansari" };

const shipped = projects.filter((p) => !p.upcoming);
const upcoming = projects.filter((p) => p.upcoming);

function ProjectArticle({ p, eyebrow, flip }: { p: Project; eyebrow: string; flip: boolean }) {
  return (
    <article
      id={p.slug}
      className="grid scroll-mt-24 items-start gap-8 md:grid-cols-2 md:gap-12"
    >
      <div className={`md:sticky md:top-24 ${flip ? "md:order-2" : ""}`}>
        <ProjectVisual slug={p.slug} />
      </div>
      <div>
        <p className="text-sm tabular-nums text-fg-faint">{eyebrow}</p>
        <h2 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">{p.name}</h2>
        <p className="mt-3 text-[17px] leading-relaxed">{p.pitch}</p>
        <ul className="mt-5 list-disc space-y-2 pl-5 leading-relaxed text-fg-muted marker:text-fg-faint">
          {p.bullets.map((b, j) => (
            <li key={j}>{b}</li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-fg-faint">{p.stack.join(" · ")}</p>
        <div className="mt-6 flex flex-wrap gap-2.5 text-sm">
          {p.github && (
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-line-strong px-3 py-1.5 transition-colors hover:bg-surface"
            >
              Source
              <ArrowUpRightIcon size={13} />
            </a>
          )}
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
          {p.site && (
            <a
              href={p.site}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-fg px-3 py-1.5 text-bg transition-opacity hover:opacity-85"
            >
              {new URL(p.site).hostname}
              <ArrowUpRightIcon size={13} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  return (
    <PageShell
      title="Projects"
      intro="Selected work in computer vision, LLM systems, and full-stack development."
    >
      <div className="space-y-24">
        {shipped.map((p, i) => (
          <ProjectArticle
            key={p.slug}
            p={p}
            eyebrow={String(i + 1).padStart(2, "0")}
            flip={i % 2 === 1}
          />
        ))}
      </div>

      {upcoming.length > 0 && (
        <section className="mt-28 border-t border-line pt-16">
          <h2 className="font-display text-2xl tracking-tight text-fg-muted">In the works</h2>
          <div className="mt-10 space-y-24">
            {upcoming.map((p, i) => (
              <ProjectArticle
                key={p.slug}
                p={p}
                eyebrow="Coming soon"
                flip={(shipped.length + i) % 2 === 1}
              />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
