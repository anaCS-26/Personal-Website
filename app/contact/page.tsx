import { CopyEmail } from "@/components/CopyEmail";
import { PageShell } from "@/components/PageShell";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { identity } from "@/lib/content";

export const metadata = { title: "Contact · Asad Ansari" };

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="contact"
      title="Let's talk"
    >
      <p className="max-w-md text-lg text-fg-muted">
        Hiring for an AI/ML role, or curious about something the assistant
        couldn&apos;t answer? My inbox is open. If you&apos;d like my résumé,
        just email me and I&apos;ll send the latest version.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <CopyEmail />
        <a
          href={identity.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-full border border-line-strong px-5 py-2.5 font-mono text-sm text-fg transition-colors hover:border-accent hover:text-accent"
        >
          <GitHubIcon size={17} />
          GitHub
        </a>
        {identity.linkedin && (
          <a
            href={identity.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-line-strong px-5 py-2.5 font-mono text-sm text-fg transition-colors hover:border-accent hover:text-accent"
          >
            <LinkedInIcon size={17} />
            LinkedIn
          </a>
        )}
      </div>
    </PageShell>
  );
}
