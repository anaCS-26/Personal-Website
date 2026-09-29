import type { TimelineEntry } from "@/lib/content";

const START = 2022;
const END = 2026;
const pct = (year: number) => ((year - START) / (END - START)) * 100;

/**
 * Gantt-style overview of roles. Internships are solid bars; the TA role is
 * outlined because it was three separate terms rather than a continuous span.
 */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const years = Array.from({ length: END - START + 1 }, (_, i) => START + i);
  const rows = [...entries].reverse();

  return (
    <figure className="rounded-xl border border-line bg-bg-elevated/80 p-5 sm:p-6">
      <figcaption className="text-sm text-fg-faint">Timeline</figcaption>
      <div className="mt-5 space-y-4">
        {rows.map((e) => {
          const intermittent = e.org === "Carleton University";
          return (
            <div key={e.org} className="grid grid-cols-[7.5rem_1fr] items-center gap-4 sm:grid-cols-[10rem_1fr]">
              <p className="truncate text-sm">{e.org}</p>
              <div className="relative h-7">
                {/* year gridlines */}
                {years.map((y) => (
                  <span
                    key={y}
                    aria-hidden="true"
                    className="absolute inset-y-0 w-px bg-(--border)"
                    style={{ left: `${pct(y)}%` }}
                  />
                ))}
                <div
                  className="group absolute top-1/2 h-2.5 -translate-y-1/2"
                  style={{ left: `${pct(e.span[0])}%`, width: `${pct(e.span[1]) - pct(e.span[0])}%` }}
                >
                  {/* generous hit target around the thin bar */}
                  <span className="absolute -inset-y-2.5 inset-x-0" />
                  <span
                    className={`block h-full rounded-[4px] ${
                      intermittent ? "border border-accent bg-accent-soft" : "bg-accent"
                    }`}
                  />
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-bg-elevated px-2 py-1 text-xs opacity-0 shadow-[0_2px_8px_var(--shadow)] transition-opacity group-hover:opacity-100">
                    {e.title} · {e.period}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div className="grid grid-cols-[7.5rem_1fr] gap-4 sm:grid-cols-[10rem_1fr]">
          <span />
          <div className="relative h-4 text-xs tabular-nums text-fg-faint">
            {years.map((y, i) => (
              <span
                key={y}
                className={`absolute ${i === 0 ? "" : i === years.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`}
                style={{ left: `${pct(y)}%` }}
              >
                {y}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
