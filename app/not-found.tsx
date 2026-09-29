import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="text-sm text-fg-faint">404</p>
      <h1 className="font-display text-4xl tracking-tight">Page not found</h1>
      <p className="max-w-sm text-fg-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-85"
      >
        Back to home
      </Link>
    </main>
  );
}
