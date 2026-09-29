import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LossLandscape } from "@/components/LossLandscape";

export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="relative isolate flex flex-1 flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] [mask-image:linear-gradient(to_bottom,#000_35%,transparent)]"
        >
          <LossLandscape cell={14} optimizers={2} className="h-full w-full" />
        </div>
        <main className="animate-enter mx-auto w-full max-w-4xl flex-1 px-5 pb-24 pt-32 sm:pt-40">
          <h1 className="font-display text-5xl tracking-tight sm:text-6xl">{title}</h1>
          {intro && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">{intro}</p>
          )}
          <div className="mt-16">{children}</div>
        </main>
      </div>
      <Footer />
    </>
  );
}
