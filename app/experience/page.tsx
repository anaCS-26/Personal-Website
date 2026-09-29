import { PageShell } from "@/components/PageShell";
import { Timeline } from "@/components/Timeline";
import { experience } from "@/lib/content";

export const metadata = { title: "Experience · Asad Ansari" };

export default function ExperiencePage() {
  return (
    <PageShell
      title="Experience"
      intro="Two co-op internships in energy, plus three terms as a teaching assistant at Carleton."
    >
      <Timeline entries={experience} />

      <ol className="mt-14 divide-y divide-line border-t border-line">
        {experience.map((e) => (
          <li key={e.org} className="grid gap-2 py-8 sm:grid-cols-[11rem_1fr] sm:gap-8">
            <div className="text-sm text-fg-faint">
              <p className="tabular-nums">{e.period}</p>
              <p className="mt-0.5">{e.location}</p>
            </div>
            <div>
              <h2 className="text-lg font-medium">{e.title}</h2>
              <p className="text-fg-muted">{e.org}</p>
              <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-5 leading-relaxed text-fg-muted marker:text-fg-faint">
                {e.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
