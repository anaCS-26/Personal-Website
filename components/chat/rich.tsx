import type { ReactNode } from "react";

// External hosts the renderer will linkify; everything else renders as text.
const ALLOWED_HOSTS = new Set([
  "github.com",
  "www.linkedin.com",
  "linkedin.com",
  "victorious-sky-0836ce10f.3.azurestaticapps.net",
]);

/** Minimal safe renderer: [text](url) links + **bold** + line breaks. */
export function renderRich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  const pushText = (chunk: string) => {
    chunk.split("\n").forEach((line, i, arr) => {
      out.push(line);
      if (i < arr.length - 1) out.push(<br key={`br-${key++}`} />);
    });
  };

  while ((m = pattern.exec(text)) !== null) {
    pushText(text.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[3] !== undefined) {
      out.push(<strong key={`b-${key++}`}>{m[3]}</strong>);
      continue;
    }
    const label = m[1];
    const href = m[2];
    let ok = false;
    if (href.startsWith("/") || href.startsWith("#")) ok = true;
    else if (href.startsWith("mailto:")) ok = true;
    else {
      try {
        ok = ALLOWED_HOSTS.has(new URL(href).host);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      const external = !href.startsWith("/") && !href.startsWith("#");
      out.push(
        <a
          key={`a-${key++}`}
          href={href}
          className="link-sweep text-accent"
          {...(external && !href.startsWith("mailto:")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </a>,
      );
    } else {
      pushText(label);
    }
  }
  pushText(text.slice(last));
  return out;
}
