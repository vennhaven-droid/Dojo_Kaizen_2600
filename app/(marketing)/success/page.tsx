import { getCmsTestimonials, getCmsGallery } from "@/lib/cms";
import { FadeIn, SectionHeading } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { BRAND, MARKETING_IMAGES } from "@/lib/brand";

export const metadata = { title: "Student Success" };

export default async function SuccessPage() {
  const [testimonials, gallery] = await Promise.all([getCmsTestimonials(), getCmsGallery()]);
  const galleryImages = gallery.length > 0
    ? gallery.map((g) => g.image_url)
    : MARKETING_IMAGES.gallery;

  return (
    <>
      <PageBanner
        title="Student Success"
        subtitle="Celebrating our champions and community."
        imageUrl={MARKETING_IMAGES.hero}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeIn key={t.id} delay={i * 0.1}>
                <div className="rounded-xl border border-gold/30 bg-kaizen-dark p-6">
                  <div className="flex gap-1 text-gold">
                    {Array.from({ length: t.rating ?? 5 }).map((_, j) => (
                      <span key={j}>★</span>
                    ))}
                  </div>
                  <p className="mt-4 text-kaizen-gray">&ldquo;{t.content}&rdquo;</p>
                  <p className="mt-4 font-semibold text-gold">{t.author_name}</p>
                  <p className="text-sm text-kaizen-muted">{t.author_role}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <SectionHeading title="Gallery" />
          </FadeIn>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {galleryImages.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-blue/20">
                <MarketingImage src={src ?? MARKETING_IMAGES.hero} alt={`Dojo Kaizen ${i + 1}`} fill />
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-kaizen-muted">
            More photos on our{" "}
            <a href={BRAND.facebook} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
              Facebook page
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
