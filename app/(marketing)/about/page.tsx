import { getCmsPage } from "@/lib/cms";
import { FadeIn, SectionHeading } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { BRAND, MARKETING_IMAGES } from "@/lib/brand";

export const metadata = { title: "About Us" };

export default async function AboutPage() {
  const page = await getCmsPage("about");
  const sections = (page?.sections ?? {}) as Record<string, unknown>;
  const values = (sections.values ?? []) as string[];

  return (
    <>
      <PageBanner
        title="About Dojo Kaizen"
        subtitle="Discipline. Respect. Continuous Improvement — in the heart of Baguio City."
        imageUrl={MARKETING_IMAGES.about}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 grid gap-8 lg:grid-cols-2">
            <FadeIn>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-2 ring-blue/30">
                <MarketingImage src={MARKETING_IMAGES.facility} alt="Dojo Kaizen facility" fill />
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h3 className="font-display text-xl font-bold text-gold">Visit Us</h3>
              <p className="mt-3 text-kaizen-silver leading-relaxed">{BRAND.location}</p>
              <p className="mt-4 text-kaizen-muted">{BRAND.hours}</p>
              <p className="mt-2">
                <a href={`tel:${BRAND.phoneTel}`} className="text-blue hover:underline">{BRAND.phone}</a>
              </p>
              <a
                href={BRAND.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-gold hover:underline"
              >
                See photos & updates on Facebook →
              </a>
            </FadeIn>
          </div>

          <div className="space-y-10">
            {[
              { title: "Our History", content: sections.history },
              { title: "Mission", content: sections.mission },
              { title: "Vision", content: sections.vision },
              { title: "Philosophy", content: sections.philosophy },
            ].map((s) => (
              <FadeIn key={s.title as string}>
                <h3 className="font-display text-xl font-bold text-gold">{s.title as string}</h3>
                <p className="mt-3 text-kaizen-muted leading-relaxed">{s.content as string}</p>
              </FadeIn>
            ))}
            {values.length > 0 && (
              <FadeIn>
                <h3 className="font-display text-xl font-bold text-gold">Core Values</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {values.map((v) => (
                    <span key={v} className="rounded-full border border-blue/40 bg-blue/10 px-4 py-2 text-sm font-semibold text-blue">
                      {v}
                    </span>
                  ))}
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
