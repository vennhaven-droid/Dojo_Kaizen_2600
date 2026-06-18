import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn, ScaleIn, SectionHeading, StaggerChildren, StaggerItem } from "@/components/marketing/motion";
import { HeroSection } from "@/components/marketing/hero-section";
import { GalleryMarquee } from "@/components/marketing/gallery-marquee";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { BRAND, FLYER_PROGRAMS, MARKETING_IMAGES } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";
import { getCmsPage, getSiteSettings } from "@/lib/cms";

export const metadata = pageMetadata(
  "Home",
  "Dojo Kaizen 2600 — Muay Thai, MMA, Boxing & BJJ in Baguio City. Train hard. Improve everyday."
);

export default async function HomePage() {
  const [page, settings] = await Promise.all([getCmsPage("home"), getSiteSettings()]);

  const sections = (page?.sections ?? {}) as Record<string, unknown>;
  const hero = (sections.hero ?? {}) as Record<string, string>;
  const aboutPreview = (sections.about_preview ?? {}) as Record<string, string>;

  return (
    <>
      <HeroSection
        headline={hero.headline ?? "TRAIN HARD. IMPROVE EVERYDAY."}
        subheadline={
          hero.subheadline ??
          "Muay Thai, MMA, Boxing & Brazilian Jiu-Jitsu in Baguio City. Discipline. Respect. Continuous improvement."
        }
        primaryCta="Enroll Now"
        imageUrl={hero.imageUrl ?? MARKETING_IMAGES.hero}
      />

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <SectionHeading title="Our Programs" subtitle="Four disciplines. One warrior mindset." />
          </FadeIn>
          <StaggerChildren className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {FLYER_PROGRAMS.map((p) => (
              <StaggerItem key={p.name}>
                <ScaleIn>
                  <div className="group h-full overflow-hidden rounded-xl border border-blue/30 bg-kaizen-dark transition-all hover:border-kaizen-red/50 hover:shadow-lg hover:shadow-kaizen-red/10">
                    <div className="relative h-28 overflow-hidden">
                      <MarketingImage
                        src={MARKETING_IMAGES.programs}
                        alt={p.name}
                        fill
                        className="opacity-50 transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-kaizen-dark to-transparent" />
                      <h3 className="absolute bottom-3 left-3 font-display text-sm font-bold text-gold sm:text-base">{p.name}</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-kaizen-muted sm:text-sm line-clamp-2">{p.tagline}</p>
                      <Link href="/programs" className="mt-3 inline-block text-xs font-semibold text-blue hover:text-gold transition-colors sm:text-sm">
                        Learn more →
                      </Link>
                    </div>
                  </div>
                </ScaleIn>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section className="border-y border-kaizen-red/20 bg-kaizen-dark/80 px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <div className="relative mx-auto aspect-square max-w-sm overflow-hidden rounded-2xl bg-kaizen-black ring-2 ring-kaizen-red/30">
              <MarketingImage
                src={MARKETING_IMAGES.kaizenWay}
                alt="Dojo Kaizen logo"
                fill
                className="object-contain p-8"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <SectionHeading title={aboutPreview.title ?? "THE KAIZEN WAY"} align="left" />
            <p className="mt-6 text-lg text-kaizen-silver leading-relaxed">
              {aboutPreview.content ??
                "At Dojo Kaizen, martial arts is a journey of continuous improvement. Every session is an opportunity to become stronger, sharper, and more disciplined."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {BRAND.coreValues.map((v) => (
                <span key={v} className="rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold">
                  {v}
                </span>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-8">
              <Link href="/about">Our Story</Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      <section className="border-y border-blue/20 bg-kaizen-black/50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn><SectionHeading title="Training Gallery" subtitle="Life at the dojo" /></FadeIn>
          <GalleryMarquee images={MARKETING_IMAGES.gallery} />
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-kaizen-red/40 bg-gradient-to-br from-kaizen-red/15 via-kaizen-dark to-blue/10 p-10 text-center ring-1 ring-gold/20">
          <FadeIn>
            <h2 className="font-display text-3xl font-bold text-kaizen-gray text-distressed">Ready to Start?</h2>
            <p className="mt-3 text-kaizen-silver">Join {settings?.academy_name ?? "Dojo Kaizen 2600"} today.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="gold" size="lg">
                <Link href="/enroll">Enroll Now</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/schedule">View Schedule</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
