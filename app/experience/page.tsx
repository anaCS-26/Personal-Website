import { PageShell } from "@/components/PageShell";
import { experience } from "@/lib/content";

export const metadata = { title: "Experience — Asad Ansari" };

export default function ExperiencePage() {
  return (
    <PageShell
      eyebrow="experience"
      title="Where I've worked"
    >
      <ol>
        {experience.map((e, i) => (
          <li key={e.org} className="relative flex gap-5 pb-12 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                  i === 0 ? "bg-accent" : "border border-line-strong bg-transparent"
                }`}
              />
              {i < experience.length - 1 && (
                <span aria-hidden="true" className="mt-2 w-px flex-1 bg-(--border)" />
              )}
            </div>
            <div>
              <p className="font-mono text-xs text-fg-faint">{e.period}</p>
              <h2 className="mt-1 text-lg font-medium">
                {e.title} <span className="text-fg-muted">· {e.org}</span>
              </h2>
              <ul className="mt-3 max-w-2xl space-y-2 text-sm text-fg-muted">
                {e.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent"
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
