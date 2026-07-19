import { PageShell } from "@/components/PageShell";
import { education, skills } from "@/lib/content";

export const metadata = { title: "About · Asad Ansari" };

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="about"
      title="A bit about me"
    >
      <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-fg-muted">
        <p>
          I took my first programming course in high school and fell in love
          with coding because it just made sense to me. I kept challenging
          myself with side projects and harder courses, and that turned into a
          Computer Science degree at Carleton in the{" "}
          <strong className="text-fg">AI &amp; Machine Learning</strong> stream
          (co-op, Dean&apos;s Honour List).
        </p>
        <p>
          My internships are where AI became real for me. At{" "}
          <strong className="text-fg">Enbridge</strong> I prototyped multimodal
          LLM agents that read gas meters from photos, and at{" "}
          <strong className="text-fg">Brookfield Renewable</strong> I turned
          three million rows of vendor spend data into reports executives used
          every week. I like owning the whole thing: train the model, wrap it
          in an API, ship it on real cloud infrastructure.
        </p>
        <p>
          Outside of work, I love racing. Watching F1, go-karting, any of it.
          I cook a lot, mostly desi food, and I game with friends to wind
          down. I grew up in Saudi Arabia, moved to Canada for university, and
          I&apos;ve been to over 10 countries so far.
        </p>
        <p>
          The assistant on the home page knows all of this and more. Ask it
          anything.
        </p>
      </div>

      <div className="mt-14 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-fg-faint">
            Education
          </h2>
          <p className="mt-3">{education.degree}</p>
          <p className="mt-1 text-sm text-fg-muted">{education.school}</p>
          <p className="mt-1 text-sm text-fg-muted">{education.detail}</p>
        </div>
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-fg-faint">
            Toolbox
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s}
                className="rounded border border-line px-2 py-0.5 font-mono text-[11px] text-fg-muted"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
