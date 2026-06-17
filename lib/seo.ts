import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://dojokaizen2600.com";

export const DEFAULT_TITLE = "Dojo Kaizen Martial Arts 2600 | Baguio City";
export const DEFAULT_DESCRIPTION =
  "Muay Thai, MMA, Boxing & kids martial arts in Baguio City. Train with discipline. Improve daily at Dojo Kaizen 2600.";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Dojo Kaizen 2600",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "martial arts Baguio",
    "Muay Thai Baguio",
    "MMA Baguio",
    "boxing gym Baguio",
    "kids martial arts",
    "Dojo Kaizen",
    "Dojo Kaizen 2600",
  ],
  authors: [{ name: "Dojo Kaizen Martial Arts 2600" }],
  creator: "Dojo Kaizen Martial Arts 2600",
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: SITE_URL,
    siteName: "Dojo Kaizen Martial Arts 2600",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/images/hero.jpg",
        width: 1920,
        height: 1080,
        alt: "Dojo Kaizen Martial Arts 2600 training in Baguio City",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/images/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export function pageMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description: description ?? DEFAULT_DESCRIPTION,
    openGraph: {
      title: `${title} | Dojo Kaizen 2600`,
      description: description ?? DEFAULT_DESCRIPTION,
    },
  };
}
