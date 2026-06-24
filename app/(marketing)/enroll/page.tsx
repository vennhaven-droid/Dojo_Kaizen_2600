import { getHomeSections, getPageBanner } from "@/lib/cms";
import { EnrollForm } from "@/components/marketing/enroll-form";
import { pageMetadata } from "@/lib/seo";
import { MARKETING_IMAGES } from "@/lib/brand";

export const metadata = pageMetadata(
  "Enroll",
  "Enroll at Dojo Kaizen 2600 — Muay Thai, MMA, boxing, and kids martial arts in Baguio City."
);

export default async function EnrollPage() {
  const [bannerUrl, homeSections] = await Promise.all([
    getPageBanner("enroll"),
    getHomeSections(),
  ]);
  const successBannerUrl = homeSections.hero.imageUrl ?? MARKETING_IMAGES.hero;
  return <EnrollForm bannerUrl={bannerUrl} successBannerUrl={successBannerUrl} />;
}
