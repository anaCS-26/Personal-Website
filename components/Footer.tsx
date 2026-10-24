import { identity } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-fg-faint">
        <p>© {new Date().getFullYear()} {identity.name}</p>
        <div className="flex gap-5">
          <a
            href={`mailto:${identity.email}`}
            data-track="link"
            className="transition-colors hover:text-fg"
          >
            Email
          </a>
          <a
            data-track="link"
            href={identity.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-fg"
          >
            GitHub
          </a>
          <a
            data-track="link"
            href={identity.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-fg"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
