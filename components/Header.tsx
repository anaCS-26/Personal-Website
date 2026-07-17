import Link from "next/link";
import { AvatarMark } from "@/components/AvatarMark";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-medium"
          aria-label="Asad Ansari — home"
        >
          <AvatarMark size={24} />
          <span className="hidden md:inline">Asad Ansari</span>
        </Link>
        <nav aria-label="Pages" className="ml-auto hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="link-sweep text-sm text-fg-muted transition-colors hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto sm:ml-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
