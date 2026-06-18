import type { Metadata } from "next";
import { Oswald, Plus_Jakarta_Sans, Rajdhani } from "next/font/google";
import "./globals.css";
import { siteMetadata } from "@/lib/seo";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${rajdhani.variable} ${oswald.variable} h-full overflow-x-hidden`}>
      <body className="min-h-full flex flex-col overflow-x-hidden bg-kaizen-black text-kaizen-gray antialiased">
        {children}
      </body>
    </html>
  );
}
