// Feature-usage events: the single list shared by the browser (lib/track.ts),
// the collector (app/api/track), the chat route, and the /stats dashboard.
// Every event and detail is allowlisted so a visitor can't write arbitrary
// keys into Redis or blow up the dashboard with junk rows.

import { SUGGESTIONS, projects } from "@/lib/content";

/** Pages counted as views. Anything else (404s) is recorded as "other". */
export const PAGES = ["/", "/about", "/experience", "/projects", "/contact"] as const;

/** Where a visit came from, bucketed so the referrer can't be free-form. */
const REFERRERS: [RegExp, string][] = [
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, "LinkedIn"],
  [/(^|\.)github\.com$/, "GitHub"],
  [/(^|\.)google\.[a-z.]+$/, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)(x|twitter)\.com$|^t\.co$/, "X"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)ycombinator\.com$/, "Hacker News"],
  [/(^|\.)indeed\.[a-z.]+$/, "Indeed"],
  [/(^|\.)(chatgpt\.com|openai\.com|claude\.ai|perplexity\.ai|gemini\.google\.com)$/, "AI assistant"],
  [/(^|\.)platefulhq\.com$/, "Plateful"],
];

export function referrerBucket(referrer: string): string {
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname;
    return REFERRERS.find(([re]) => re.test(host))?.[1] ?? "Other";
  } catch {
    return "Other";
  }
}

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** `?ref=` tags that name a source by another spelling. */
const REF_ALIASES: Record<string, string> = {
  hn: "Hacker News",
  twitter: "X",
};

/**
 * Where a visit came from: a `?ref=` (or `utm_source=`) tag on the link
 * wins, since apps like Reddit's often send no referrer at all; otherwise
 * the referring site. Tags are matched case- and punctuation-insensitively
 * against the known sources ("reddit", "Reddit", "hacker-news"); an unknown
 * tag falls back to the referrer, so links can't add rows to the dashboard.
 */
export function visitSource(search: string, referrer: string): string {
  const params = new URLSearchParams(search);
  const tag = squash(params.get("ref") ?? params.get("utm_source") ?? "");
  if (tag) {
    const label =
      REF_ALIASES[tag] ?? REFERRERS.map(([, l]) => l).find((l) => squash(l) === tag);
    if (label) return label;
  }
  return referrerBucket(referrer);
}

const LINK_KINDS = { github: "source", demo: "demo", appStore: "appstore", site: "site" } as const;
const stripSlash = (u: string) => u.replace(/\/+$/, "");

/**
 * Bounded label for a link's destination: a site page, a project's details,
 * a project's source/demo/App Store/site link, email, GitHub, or LinkedIn.
 */
export function linkTarget(href: string): string {
  if (href.startsWith("mailto:")) return "email";
  let url: URL;
  try {
    url = new URL(href, "https://asad-ansari.dev");
  } catch {
    return "other";
  }
  // Relative hrefs resolve against the site, so they land here too
  if (url.hostname === "asad-ansari.dev") {
    const slug = url.hash.slice(1);
    if (url.pathname === "/projects" && projects.some((p) => p.slug === slug)) {
      return `/projects#${slug}`;
    }
    return (PAGES as readonly string[]).includes(url.pathname) ? url.pathname : "other";
  }
  for (const p of projects) {
    for (const [field, kind] of Object.entries(LINK_KINDS)) {
      const target = p[field as keyof typeof LINK_KINDS];
      if (target && stripSlash(target) === stripSlash(url.href)) return `${p.slug}:${kind}`;
    }
  }
  if (url.hostname.endsWith("linkedin.com")) return "linkedin";
  if (url.hostname === "github.com") return "github";
  return "other";
}

const LINK_TARGETS = [
  "email",
  "github",
  "linkedin",
  ...PAGES,
  ...projects.flatMap((p) => [
    `/projects#${p.slug}`,
    ...Object.entries(LINK_KINDS)
      .filter(([field]) => p[field as keyof typeof LINK_KINDS])
      .map(([, kind]) => `${p.slug}:${kind}`),
  ]),
  "other",
];

/** Events the browser may send, each with its allowed details (null: none). */
export const CLIENT_EVENTS = {
  view: [...PAGES, "other"],
  visit: ["new", "returning"], // once per visit: has this browser been here before?
  referrer: [...REFERRERS.map(([, label]) => label), "Direct", "Other"],
  suggestion: SUGGESTIONS,
  voice: null,
  card: LINK_TARGETS, // a link on a project card in the chat
  chat_link: LINK_TARGETS, // a link inside an AsadGPT reply
  link: LINK_TARGETS, // a link on a site page (projects, contact, footer)
  email_copy: null,
  theme: ["dark", "light"],
} satisfies Record<string, readonly string[] | null>;

export type ClientEvent = keyof typeof CLIENT_EVENTS;

/** Events only the server records, from the chat route. */
export type ServerEvent =
  | "chat_message" // detail: which user turn of the conversation, "1".."6+"
  | "chat_blocked" // detail: ip | paused | budget
  | "chat_error"; // detail: upstream | stream | refusal

export function isClientEvent(event: unknown, detail: unknown): event is ClientEvent {
  if (typeof event !== "string" || !Object.hasOwn(CLIENT_EVENTS, event)) return false;
  const allowed: readonly string[] | null = CLIENT_EVENTS[event as ClientEvent];
  return allowed === null
    ? detail === undefined
    : typeof detail === "string" && allowed.includes(detail);
}

/** Human-readable label for a linkTarget() value, for the dashboard. */
export function describeTarget(target: string): string {
  if (target === "email") return "Email link";
  if (target === "github") return "GitHub profile";
  if (target === "linkedin") return "LinkedIn";
  if (target === "other") return "Other";
  if (target.startsWith("/projects#")) {
    const p = projects.find((x) => `/projects#${x.slug}` === target);
    return `${p?.name ?? target} details`;
  }
  if (target.startsWith("/")) return target;
  const [slug, kind] = target.split(":");
  const name = projects.find((p) => p.slug === slug)?.name ?? slug;
  const kinds: Record<string, string> = {
    source: "source",
    demo: "live demo",
    appstore: "App Store",
    site: "website",
  };
  return `${name} ${kinds[kind] ?? kind}`;
}
