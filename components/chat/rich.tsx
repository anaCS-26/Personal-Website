import type { ReactNode } from "react";

// External hosts the renderer will linkify; everything else renders as text.
const ALLOWED_HOSTS = new Set([
  "github.com",
  "www.linkedin.com",
  "linkedin.com",
  "victorious-sky-0836ce10f.3.azurestaticapps.net",
  "platefulhq.com",
  "www.platefulhq.com",
]);

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

/**
 * Minimal safe renderer: paragraphs, bulleted/numbered lists, [text](url)
 * links, and **bold**.
 */
export function renderRich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flushPara = () => {
    if (para.length === 0) return;
    const lines = para;
    out.push(
      <p key={`p-${key++}`}>
        {lines.flatMap((line, i) =>
          i < lines.length - 1
            ? [...renderInline(line, `${key}-${i}`), <br key={`br-${i}`} />]
            : renderInline(line, `${key}-${i}`),
        )}
      </p>,
    );
    para = [];
  };

  const flushList = () => {
    if (!list) return;
    const { ordered, items } = list;
    const Tag = ordered ? "ol" : "ul";
    out.push(
      <Tag
        key={`l-${key++}`}
        className={`space-y-1 pl-5 marker:text-fg-faint ${ordered ? "list-decimal" : "list-disc"}`}
      >
        {items.map((item, i) => (
          <li key={i}>{renderInline(item, `${key}-${i}`)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (const line of text.split("\n")) {
    const ordered = NUMBERED.test(line);
    if (ordered || BULLET.test(line)) {
      flushPara();
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push(line.replace(ordered ? NUMBERED : BULLET, ""));
    } else if (line.trim() === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return out;
}

function renderInline(text: string, prefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = pattern.exec(text)) !== null) {
    out.push(text.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[3] !== undefined) {
      // Bold can wrap a link ("**[PulmoLens](/projects#pulmolens):**")
      const k = `${prefix}-b-${key++}`;
      out.push(<strong key={k}>{renderInline(m[3], k)}</strong>);
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
          key={`${prefix}-a-${key++}`}
          href={href}
          className="text-link"
          {...(external && !href.startsWith("mailto:")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </a>,
      );
    } else {
      out.push(label);
    }
  }
  out.push(text.slice(last));
  return out;
}

/** Project slugs linked as /projects#slug, in order of first mention. */
export function linkedProjectSlugs(text: string): string[] {
  const slugs: string[] = [];
  for (const m of text.matchAll(/\]\(\/projects#([a-z0-9-]+)\)/g)) {
    if (!slugs.includes(m[1])) slugs.push(m[1]);
  }
  return slugs;
}
