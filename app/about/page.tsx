import { PageShell } from "@/components/PageShell";
import { education, skills } from "@/lib/content";

export const metadata = { title: "About — Asad Ansari" };

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="about"
      title="I build systems that learn"
    >
      <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-fg-muted">
        <p>
          I&apos;m a recent Carleton University graduate — Bachelor of Computer
          Science Honours in the <strong className="text-fg">AI &amp; Machine Learning</strong>{" "}
          stream (co-op), Dean&apos;s Honour List — and I like building AI
          systems end to end: training models in PyTorch, wrapping them in
          production APIs, grounding LLMs with RAG, and shipping on real cloud
          infrastructure.
        </p>
        <p>
          That taste for applied AI came from the energy sector: at{" "}
          <strong className="text-fg">Enbridge</strong> I prototyped multimodal
          LLM agents for reading gas meters from photos, and at{" "}
          <strong className="text-fg">Brookfield Renewable</strong>{" "}
          I turned three million rows of vendor spend into models executives actually
          used. I&apos;m happiest when reliable data, a well-evaluated model,
          and a clean interface come together into something people use.
        </p>
        <p>
          The assistant on the home page is a working example — a live LLM
          grounded in my real experience, with rate limiting, streaming, and
          honest &quot;I don&apos;t know&quot; answers built in.
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
