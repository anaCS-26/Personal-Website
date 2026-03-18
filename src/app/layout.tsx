import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import SmoothScrolling from "@/components/SmoothScrolling";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Asad Ansari | Engineering Intelligence",
  description: "A premium minimalist portfolio showcasing AI & Cloud Engineering architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable}`}>
        <SmoothScrolling>
          {children}
        </SmoothScrolling>
      </body>
    </html>
  );
}
