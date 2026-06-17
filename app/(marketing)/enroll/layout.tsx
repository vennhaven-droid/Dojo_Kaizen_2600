import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Enroll",
  "Start your martial arts journey at Dojo Kaizen 2600. Submit your enrollment application online."
);

export default function EnrollLayout({ children }: { children: React.ReactNode }) {
  return children;
}
