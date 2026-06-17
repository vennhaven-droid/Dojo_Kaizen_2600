import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Contact",
  "Visit Dojo Kaizen 2600 in Baguio City. Call, WhatsApp, or send us a message to book your first class."
);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
