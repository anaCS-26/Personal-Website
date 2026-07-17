import Link from "next/link";
import { AvatarMark } from "@/components/AvatarMark";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-5 text-center">
      <AvatarMark size={64} thinking />
      <h1 className="font-display text-4xl">404 — even I don&apos;t know this one</h1>
      <p className="max-w-sm text-fg-muted">
        This page doesn&apos;t exist. My knowledge only covers Asad — and Asad
        never built this URL.
      </p>
      <Link
        href="/"
        className="rounded-full bg-accent px-5 py-2.5 font-mono text-sm text-accent-contrast transition-opacity hover:opacity-90"
      >
        back home →
      </Link>
    </main>
  );
}
