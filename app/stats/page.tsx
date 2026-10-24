import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { StatsOptOut } from "@/components/StatsOptOut";
import { ArrowUpRightIcon } from "@/components/icons";
import { readStats, type DayStats } from "@/lib/analytics";
import { describeTarget } from "@/lib/events";

// Private dashboard; proxy.ts puts it behind STATS_PASSWORD.
export const metadata: Metadata = {
  title: "Stats · Asad Ansari",
  robots: { index: false, follow: false },
};

const RANGES = [7, 30, 90];
const VERCEL_ANALYTICS =
  "https://vercel.com/anajunk03-5723s-projects/personal-website/analytics";

type Row = [label: string, count: number];

function sumCounts(days: DayStats[]): Record<string, number> {
  const total: Record<string, number> = {};
  for (const d of days) {
    for (const [field, n] of Object.entries(d.counts)) total[field] = (total[field] ?? 0) + n;
  }
  return total;
}

/** Details of one event, largest first. */
function breakdown(total: Record<string, number>, event: string): Row[] {
  return Object.entries(total)
    .filter(([field]) => field.startsWith(`${event}:`))
    .map(([field, n]): Row => [field.slice(event.length + 1), n])
    .sort((a, b) => b[1] - a[1]);
}

const sum = (rows: Row[]) => rows.reduce((acc, [, n]) => acc + n, 0);

const fmtDay = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

/** Round an axis maximum up to a clean number with a clean midpoint. */
function niceMax(v: number): number {
  if (v <= 2) return 2;
  const p = 10 ** Math.floor(Math.log10(v));
  return ([1, 2, 4, 6, 8, 10].find((m) => m * p >= v) ?? 10) * p;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-bg-elevated/90 p-4">
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value.toLocaleString("en-US")}</p>
    </div>
  );
}

function DailyChart({
  title,
  unit,
  days,
  values,
}: {
  title: string;
  unit: string;
  days: string[];
  values: number[];
}) {
  const max = niceMax(Math.max(0, ...values));
  return (
    <figure className="rounded-xl border border-line bg-bg-elevated/90 p-5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl tracking-tight">{title}</h2>
        <span className="text-xs text-fg-faint">per UTC day</span>
      </figcaption>
      <div className="mt-6 flex gap-2">
        <div className="flex h-40 flex-col justify-between text-right text-xs tabular-nums text-fg-faint">
          <span className="-translate-y-1/2">{max}</span>
          <span>{max / 2}</span>
          <span className="translate-y-1/2">0</span>
        </div>
        <div className="relative h-40 flex-1">
          <div className="absolute inset-x-0 top-0 border-t border-line" />
          <div className="absolute inset-x-0 top-1/2 border-t border-line" />
          <div className="absolute inset-x-0 bottom-0 border-t border-line-strong" />
          <ol className="absolute inset-0 flex items-end gap-[2px]">
            {days.map((day, i) => (
              <li
                key={day}
                tabIndex={0}
                aria-label={`${fmtDay(day)}: ${values[i]} ${unit}`}
                className="group relative flex h-full flex-1 items-end justify-center outline-none"
              >
                <div
                  className="w-full max-w-6 rounded-t-[4px] bg-accent transition-opacity group-hover:opacity-75 group-focus-visible:opacity-75"
                  style={{ height: `${(values[i] / max) * 100}%` }}
                />
                <div
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-bg-elevated px-2 py-1 text-xs shadow-[0_2px_10px_var(--shadow)] group-hover:block group-focus-visible:block"
                >
                  <span className="text-fg-muted">{fmtDay(day)}</span>{" "}
                  <span className="font-medium tabular-nums">{values[i]}</span> {unit}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mt-2 flex justify-between pl-8 text-xs text-fg-faint">
        <span>{fmtDay(days[0])}</span>
        <span>{fmtDay(days[days.length - 1])}</span>
      </div>
    </figure>
  );
}

function Ranked({ title, note, rows }: { title: string; note?: string; rows: Row[] }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <section className="rounded-xl border border-line bg-bg-elevated/90 p-5">
      <h2 className="font-display text-xl tracking-tight">{title}</h2>
      {note && <p className="mt-1 text-xs text-fg-faint">{note}</p>}
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-fg-faint">Nothing yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map(([label, n]) => (
            <li key={label} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="break-words">{label}</span>
                <span className="tabular-nums text-fg-muted">{n.toLocaleString("en-US")}</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-surface">
                <div className="h-1 rounded-full bg-accent" style={{ width: `${(n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const targets = (rows: Row[]): Row[] => rows.map(([t, n]) => [describeTarget(t), n]);

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: raw } = await searchParams;
  const range = RANGES.includes(Number(raw)) ? Number(raw) : 30;
  const stats = await readStats(range);

  if (!stats) {
    return (
      <PageShell title="Stats">
        <p className="max-w-2xl leading-relaxed text-fg-muted">
          Usage is only recorded on the production deployment, with the
          Upstash Redis variables set. Nothing to show in this environment.
        </p>
      </PageShell>
    );
  }

  const total = sumCounts(stats.days);
  const days = stats.days.map((d) => d.day);
  const depth = breakdown(total, "chat_message").sort((a, b) =>
    a[0].localeCompare(b[0], "en", { numeric: true }),
  );
  const conversations = total["chat_message:1"] ?? 0;
  const features: Row[] = [
    ["Voice input", total["voice"] ?? 0],
    ["Copied email address", total["email_copy"] ?? 0],
    ["Switched to dark theme", total["theme:dark"] ?? 0],
    ["Switched to light theme", total["theme:light"] ?? 0],
  ];
  const BLOCKED: Record<string, string> = {
    ip: "Rate limited (per visitor)",
    paused: "Paused for new visitors",
    budget: "Daily budget reached",
  };
  const ERRORS: Record<string, string> = {
    upstream: "Model unavailable",
    stream: "Reply interrupted",
    refusal: "Safety refusal",
  };
  const health: Row[] = [
    ...breakdown(total, "chat_blocked").map(([k, n]): Row => [BLOCKED[k] ?? k, n]),
    ...breakdown(total, "chat_error").map(([k, n]): Row => [ERRORS[k] ?? k, n]),
  ];

  return (
    <PageShell title="Stats">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Date range" className="flex gap-1 rounded-lg border border-line p-1 text-sm">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/stats?days=${r}`}
              aria-current={r === range ? "page" : undefined}
              className={`rounded-md px-3 py-1 transition-colors ${
                r === range ? "bg-surface text-fg" : "text-fg-muted hover:text-fg"
              }`}
            >
              {r} days
            </Link>
          ))}
        </nav>
        <StatsOptOut />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Visitors" value={stats.visitors} />
        <Stat label="New visitors" value={total["visit:new"] ?? 0} />
        <Stat label="Return visits" value={total["visit:returning"] ?? 0} />
        <Stat label="Page views" value={sum(breakdown(total, "view"))} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Conversations" value={conversations} />
        <Stat label="Chat messages" value={sum(depth)} />
        <Stat label="Chatters" value={stats.chatters} />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <DailyChart
          title="New visitors"
          unit="new visitors"
          days={days}
          values={stats.days.map((d) => d.counts["visit:new"] ?? 0)}
        />
        <DailyChart
          title="AsadGPT conversations"
          unit="conversations"
          days={days}
          values={stats.days.map((d) => d.counts["chat_message:1"] ?? 0)}
        />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Ranked title="Pages" rows={breakdown(total, "view")} />
        <Ranked
          title="Where visitors came from"
          note="The referring site on each visitor's first page of a visit."
          rows={breakdown(total, "referrer")}
        />
        <Ranked
          title="Suggestion chips"
          note="Starter questions clicked under the chat bar."
          rows={breakdown(total, "suggestion")}
        />
        <Ranked
          title="Conversation depth"
          note="Conversations that reached each question."
          rows={depth.map(([turn, n]): Row => [`Question ${turn}`, n])}
        />
        <Ranked
          title="Links in AsadGPT replies"
          rows={targets(breakdown(total, "chat_link"))}
        />
        <Ranked
          title="Project cards in chat"
          rows={targets(breakdown(total, "card"))}
        />
        <Ranked
          title="Links on site pages"
          note="Project, contact, and footer links."
          rows={targets(breakdown(total, "link"))}
        />
        <Ranked title="Other features" rows={features.filter(([, n]) => n > 0)} />
        <Ranked
          title="Chat health"
          note="Messages turned away or answered with an error."
          rows={health}
        />
      </div>

      <details className="mt-3 rounded-xl border border-line bg-bg-elevated/90 p-5">
        <summary className="cursor-pointer font-display text-xl tracking-tight">
          Daily numbers
        </summary>
        <table className="mt-4 w-full text-sm tabular-nums">
          <thead className="text-left text-fg-faint">
            <tr>
              <th className="py-1.5 font-normal">Day</th>
              <th className="py-1.5 text-right font-normal">Visitors</th>
              <th className="py-1.5 text-right font-normal">New</th>
              <th className="py-1.5 text-right font-normal">Page views</th>
              <th className="py-1.5 text-right font-normal">Conversations</th>
              <th className="py-1.5 text-right font-normal">Messages</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[...stats.days].reverse().map((d) => (
              <tr key={d.day}>
                <td className="py-1.5">{fmtDay(d.day)}</td>
                <td className="py-1.5 text-right">{d.visitors}</td>
                <td className="py-1.5 text-right">{d.counts["visit:new"] ?? 0}</td>
                <td className="py-1.5 text-right">{sum(breakdown(d.counts, "view"))}</td>
                <td className="py-1.5 text-right">{d.counts["chat_message:1"] ?? 0}</td>
                <td className="py-1.5 text-right">{sum(breakdown(d.counts, "chat_message"))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <p className="mt-8 text-sm text-fg-muted">
        Countries, devices, browsers, and full referrer URLs for the last month
        are in{" "}
        <a
          href={VERCEL_ANALYTICS}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-link"
        >
          Vercel Web Analytics
          <ArrowUpRightIcon size={12} />
        </a>
        .
      </p>
      <p className="mt-3 text-sm text-fg-muted">
        Visitors are distinct network addresses (estimated; no IP is stored),
        so the range total counts someone on two networks twice. New visitors
        are browsers on their first visit, and return visits are later visits
        from those browsers; a private window or cleared browser counts as new.
        Browsers that send Global Privacy Control or Do Not Track aren&apos;t
        counted.
      </p>
    </PageShell>
  );
}
