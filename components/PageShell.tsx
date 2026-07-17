import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function PageShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-20 pt-28">
        <p className="animate-fade-up font-mono text-sm text-accent">{eyebrow}</p>
        <h1
          className="animate-fade-up mt-1 font-display text-4xl sm:text-5xl"
          style={{ animationDelay: "80ms" }}
        >
          {title}
        </h1>
        <div className="animate-fade-up mt-10" style={{ animationDelay: "180ms" }}>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
