import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

// Normal style only — titles are deliberately non-italic, single color
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asad Ansari · AI/ML Engineer",
  description:
    "Portfolio of Asad Ansari: machine learning engineer building computer vision and LLM-powered systems. Ask the site's AI assistant anything about his work.",
};

// Runs before paint: applies the saved theme, else the OS preference, so there
// is no flash.
const themeInit = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.dataset.theme=t}catch(e){d.dataset.theme="light"}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${newsreader.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* suppressHydrationWarning: browser extensions inject scripts into
            <head> before React hydrates, tripping a false mismatch here */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      {/* suppressHydrationWarning: extensions (e.g. Grammarly) stamp attributes
          onto <body> before hydration; suppression is attribute-only, children
          still hydrate strictly */}
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
