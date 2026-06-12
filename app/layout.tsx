import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

import { LOGO_REMOTE } from "@/lib/brand";

export const metadata: Metadata = {
  title: {
    default: "Dojo Kaizen Martial Arts 2600",
    template: "%s | Dojo Kaizen",
  },
  description:
    "Premium martial arts academy in Baguio City. Muay Thai, MMA, Boxing, BJJ & more. Train with discipline. Improve continuously.",
  icons: { icon: LOGO_REMOTE },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-kaizen-black text-kaizen-gray antialiased">
        {children}
      </body>
    </html>
  );
}
