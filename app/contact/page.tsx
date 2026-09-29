import { CopyEmail } from "@/components/CopyEmail";
import { PageShell } from "@/components/PageShell";
import { ArrowUpRightIcon } from "@/components/icons";
import { identity } from "@/lib/content";

export const metadata = { title: "Contact · Asad Ansari" };

const profiles = [
  { label: "GitHub", href: identity.github, text: "github.com/anaCS-26" },
  {
    label: "LinkedIn",
    href: identity.linkedin,
    text: "linkedin.com/in/asad-ansari-ontario",
  },
];

export default function ContactPage() {
  return (
    <PageShell
      title="Contact"
      intro={
        <>
          I&apos;m open to AI/ML roles anywhere in Canada and happy to
          relocate. Email is the best way to reach me. If you&apos;d like my
          résumé, ask and I&apos;ll send the latest version.
        </>
      }
    >
      <dl className="max-w-2xl divide-y divide-line border-y border-line">
        <div className="grid items-center gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
          <dt className="text-sm text-fg-faint">Email</dt>
          <dd className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href={`mailto:${identity.email}`} className="text-link">
              {identity.email}
            </a>
            <CopyEmail />
          </dd>
        </div>
        {profiles.map((p) => (
          <div
            key={p.label}
            className="grid items-center gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6"
          >
            <dt className="text-sm text-fg-faint">{p.label}</dt>
            <dd>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
              >
                {p.text}
                <ArrowUpRightIcon size={13} />
              </a>
            </dd>
          </div>
        ))}
        <div className="grid items-center gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
          <dt className="text-sm text-fg-faint">Location</dt>
          <dd>{identity.location}</dd>
        </div>
      </dl>
    </PageShell>
  );
}
