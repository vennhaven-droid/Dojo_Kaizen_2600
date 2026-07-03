import Link from "next/link";
import { getFacilityGallery, getPageBanner } from "@/lib/cms";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { FacilityGallery } from "@/components/marketing/facility-gallery";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Our Facility",
  "Tour Dojo Kaizen 2600 — training mats, bags, and equipment in Baguio City."
);

export default async function FacilityPage() {
  const [gallery, bannerUrl] = await Promise.all([getFacilityGallery(), getPageBanner("facility")]);

  return (
    <>
      <PageBanner
        title="Our Facility"
        subtitle="Train in a fully equipped martial arts academy in the heart of Baguio."
        imageUrl={bannerUrl}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-bold text-gold sm:text-3xl">
                Where Champions Train
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-kaizen-silver sm:text-base">
                Dojo Kaizen 2600 is built for serious training — spacious mats, heavy bags, ring work,
                and a community that pushes you to improve every day. Visit us at {BRAND.location}.
              </p>
              <p className="mt-2 text-sm text-kaizen-muted">{BRAND.hours}</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild variant="gold">
                  <Link href="/contact">Book a Visit</Link>
                </Button>
                <Button asChild variant="outline">
                  <a href={BRAND.mapsUrl} target="_blank" rel="noopener noreferrer">
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-12">
              <FacilityGallery items={gallery} />
            </div>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
