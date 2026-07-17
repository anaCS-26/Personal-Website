import type { Metadata } from "next";
import { Newsreader, Schibsted_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Normal style only — titles are deliberately non-italic, single color
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal"],
});

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asad Ansari — AI/ML Engineer",
  description:
    "Portfolio of Asad Ansari: machine learning engineer building computer vision and LLM-powered systems. Ask the site's AI assistant anything about his work.",
};

// Runs before paint: applies the saved theme (default dark) so there is no flash.
const themeInit = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}else{document.documentElement.dataset.theme="dark"}}catch(e){document.documentElement.dataset.theme="dark"}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${newsreader.variable} ${schibsted.variable} ${jetbrains.variable} h-full antialiased`}
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
