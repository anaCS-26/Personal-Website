import { identity } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-6 font-mono text-[11px] text-fg-faint">
        <p>{identity.status}</p>
        <p>
          built by {identity.name} · Next.js + a well-behaved LLM ·{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
