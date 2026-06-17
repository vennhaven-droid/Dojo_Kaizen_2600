import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn, SectionHeading } from "@/components/marketing/motion";
import { HeroSection } from "@/components/marketing/hero-section";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { MARKETING_IMAGES } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";
import {
  getCmsPage,
  getCmsPrograms,
  getCmsTestimonials,
  getCmsEvents,
  getSiteSettings,
} from "@/lib/cms";

export const metadata = pageMetadata(
  "Home",
  "Dojo Kaizen 2600 — Muay Thai, MMA, Boxing & kids martial arts in Baguio City. Book a free trial today."
);

export default async function HomePage() {
  const [page, programs, testimonials, events, settings] = await Promise.all([
    getCmsPage("home"),
    getCmsPrograms(),
    getCmsTestimonials(),
    getCmsEvents(),
    getSiteSettings(),
  ]);

  const sections = (page?.sections ?? {}) as Record<string, unknown>;
  const hero = (sections.hero ?? {}) as Record<string, string>;
  const aboutPreview = (sections.about_preview ?? {}) as Record<string, string>;
  const faq = (sections.faq ?? []) as Array<{ q: string; a: string }>;

  return (
    <>
      <HeroSection
        headline={hero.headline}
        subheadline={hero.subheadline}
        primaryCta={hero.primaryCta}
        secondaryCta={hero.secondaryCta}
        imageUrl={hero.imageUrl ?? MARKETING_IMAGES.hero}
      />

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <SectionHeading title="Our Programs" subtitle="World-class training for every age and skill level" />
          </FadeIn>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(programs ?? []).slice(0, 8).map((p, i) => (
              <FadeIn key={p.id ?? i} delay={i * 0.1}>
                <div className="group overflow-hidden rounded-xl border border-blue/30 bg-kaizen-dark transition-all hover:border-gold/40 hover:shadow-lg hover:shadow-blue/10">
                  <div className="relative h-36 overflow-hidden">
                    <MarketingImage
                      src={MARKETING_IMAGES.programs}
                      alt="Training"
                      fill
                      className="opacity-60 transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-kaizen-dark to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold text-gold">
                      {p.title ?? (p as { programs?: { name?: string } }).programs?.name}
                    </h3>
                    <p className="mt-2 text-sm text-kaizen-muted line-clamp-3">
                      {p.description ?? (p as { programs?: { description?: string } }).programs?.description}
                    </p>
                    <Link href="/programs" className="mt-4 inline-block text-sm font-semibold text-blue hover:underline">
                      Learn more →
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue/20 bg-kaizen-dark/80 px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <div className="relative aspect-square max-w-md overflow-hidden rounded-2xl ring-2 ring-gold/30">
              <MarketingImage src={MARKETING_IMAGES.about} alt="Dojo Kaizen academy" fill />
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <SectionHeading title={aboutPreview.title ?? "THE KAIZEN WAY"} align="left" />
            <p className="mt-6 text-lg text-kaizen-silver leading-relaxed">{aboutPreview.content}</p>
            <Button asChild variant="outline" className="mt-8">
              <Link href="/about">Our Story</Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn><SectionHeading title="What Students Say" /></FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {(testimonials ?? []).map((t, i) => (
              <FadeIn key={t.id} delay={i * 0.1}>
                <blockquote className="rounded-xl border border-blue/30 bg-kaizen-dark p-6">
                  <p className="text-kaizen-gray">&ldquo;{t.content}&rdquo;</p>
                  <footer className="mt-4">
                    <p className="font-semibold text-gold">{t.author_name}</p>
                    <p className="text-sm text-kaizen-muted">{t.author_role}</p>
                  </footer>
                </blockquote>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue/20 bg-kaizen-dark/50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <FadeIn><SectionHeading title="Training Gallery" subtitle="A glimpse of life at the dojo" /></FadeIn>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MARKETING_IMAGES.gallery.map((src, i) => (
              <FadeIn key={src} delay={i * 0.08}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-blue/30">
                  <MarketingImage src={src} alt={`Dojo Kaizen training ${i + 1}`} fill className="transition-transform hover:scale-105" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 bg-kaizen-dark/50">
        <div className="mx-auto max-w-7xl">
          <FadeIn><SectionHeading title="Upcoming Events" /></FadeIn>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {(events ?? []).slice(0, 3).map((e) => (
              <div key={e.id} className="rounded-xl border border-blue/30 bg-kaizen-dark p-5">
                <p className="text-xs font-semibold uppercase text-blue">{e.event_type}</p>
                <h3 className="mt-2 font-display font-bold text-kaizen-gray">{e.title}</h3>
                <p className="mt-1 text-sm text-kaizen-muted">{e.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="secondary"><Link href="/events">All Events</Link></Button>
          </div>
        </div>
      </section>

      {faq.length > 0 && (
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <FadeIn><SectionHeading title="FAQ" /></FadeIn>
            <div className="mt-10 space-y-4">
              {faq.map((item, i) => (
                <details key={i} className="rounded-xl border border-blue/30 bg-kaizen-dark p-5">
                  <summary className="cursor-pointer font-semibold text-kaizen-gray">{item.q}</summary>
                  <p className="mt-3 text-sm text-kaizen-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gold/40 bg-gradient-to-br from-blue/15 to-gold/10 p-10 text-center ring-1 ring-gold/20">
          <h2 className="font-display text-3xl font-bold text-kaizen-gray text-distressed">Ready to Start?</h2>
          <p className="mt-3 text-kaizen-silver">Join {settings?.academy_name ?? "Dojo Kaizen"} today.</p>
          <Button asChild variant="gold" size="lg" className="mt-8">
            <Link href="/enroll">Enroll Now</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
