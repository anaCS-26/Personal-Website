import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { education, identity, skills } from "@/lib/content";

export const metadata = { title: "About · Asad Ansari" };

const hobbies = [
  { title: "Racing", text: "Watching F1, go-karting, any of it." },
  { title: "Cooking", text: "I cook a lot, mostly desi food." },
  { title: "Gaming", text: "With friends, to wind down." },
  {
    title: "10+ countries",
    text: "Grew up in Saudi Arabia, moved to Canada for university.",
  },
];

export default function AboutPage() {
  return (
    <PageShell title="About">
      <div className="max-w-2xl space-y-5 text-[17px] leading-relaxed text-fg-muted">
        <p>
          I took my first programming course in high school and fell in love
          with coding because it just made sense to me. I kept challenging
          myself with side projects and harder courses, and that turned into a
          Computer Science degree at Carleton in the{" "}
          <span className="text-fg">AI &amp; Machine Learning</span>{" "}
          stream
          (co-op, Dean&apos;s Honour List).
        </p>
        <p>
          My internships are where AI became real for me. At{" "}
          <span className="text-fg">Enbridge</span> I prototyped multimodal LLM
          agents that read gas meters from photos, and at{" "}
          <span className="text-fg">Brookfield Renewable</span> I turned three
          million rows of vendor spend data into reports executives used every
          week. I like owning the whole thing: train the model, wrap it in an
          API, ship it on real cloud infrastructure.
        </p>
      </div>

      <section className="mt-16">
        <h2 className="text-sm text-fg-faint">Outside of work</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hobbies.map((h) => (
            <div
              key={h.title}
              className="rounded-xl border border-line bg-bg-elevated/80 p-5"
            >
              <p className="font-display text-2xl tracking-tight">{h.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{h.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-fg-muted">
          Have a question this page doesn&apos;t answer?{" "}
          <Link href="/?chat=true" className="text-link">
            Ask AsadGPT
          </Link>
          , the assistant on the home page.
        </p>
      </section>

      <dl className="mt-16 max-w-2xl divide-y divide-line border-y border-line">
        <div className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
          <dt className="text-sm text-fg-faint">Education</dt>
          <dd>
            <p>{education.degree}</p>
            <p className="mt-1 text-sm text-fg-muted">{education.school}</p>
            <p className="mt-1 text-sm leading-relaxed text-fg-muted">
              {education.detail}
            </p>
          </dd>
        </div>
        <div className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
          <dt className="text-sm text-fg-faint">Skills</dt>
          <dd className="leading-relaxed">{skills.join(", ")}</dd>
        </div>
        <div className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
          <dt className="text-sm text-fg-faint">Based in</dt>
          <dd>{identity.location}</dd>
        </div>
      </dl>
    </PageShell>
  );
}
