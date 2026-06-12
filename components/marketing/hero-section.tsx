import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/marketing/motion";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { BRAND, MARKETING_IMAGES } from "@/lib/brand";

type HeroSectionProps = {
  headline?: string;
  subheadline?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string;
};

export function HeroSection({
  headline = "TRAIN HARD. IMPROVE DAILY.",
  subheadline = "Muay Thai, MMA, Boxing & martial arts training in Baguio City. Built on discipline, respect, and the Kaizen philosophy.",
  primaryCta = "Enroll Now",
  secondaryCta = "Book Free Trial",
  imageUrl = MARKETING_IMAGES.hero,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <div className="absolute inset-0">
        <MarketingImage
          src={imageUrl}
          alt="Dojo Kaizen Martial Arts 2600"
          fill
          priority
          className="scale-110 blur-sm opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-kaizen-black/80 via-kaizen-black/90 to-kaizen-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(13,116,209,0.15)_0%,_transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <FadeIn>
          <div className="mb-8">
            <MarketingImage
              src={imageUrl}
              alt="Dojo Kaizen logo"
              width={160}
              height={160}
              priority
              className="mx-auto rounded-full ring-4 ring-gold/50 shadow-2xl shadow-blue/20"
            />
          </div>
          <p className="font-display text-sm font-bold tracking-[0.35em] text-gold">DOJO KAIZEN 2600</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-kaizen-gray sm:text-6xl lg:text-7xl text-distressed">
            {headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-kaizen-silver">{subheadline}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="gold" size="lg">
              <Link href="/enroll">{primaryCta}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/enroll">{secondaryCta}</Link>
            </Button>
          </div>
          <p className="mt-8 text-sm text-kaizen-muted">
            <a href={BRAND.facebook} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
              Follow us on Facebook
            </a>
            {" · "}
            {BRAND.location}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

export function PageBanner({
  title,
  subtitle,
  imageUrl = MARKETING_IMAGES.hero,
  children,
}: {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-blue/20 py-20 sm:py-28">
      <div className="absolute inset-0">
        <MarketingImage src={imageUrl} alt={title} fill className="opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-kaizen-black via-kaizen-black/95 to-kaizen-black/80" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn>
          <p className="font-display text-xs font-bold tracking-[0.3em] text-gold">DOJO KAIZEN 2600</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-kaizen-gray sm:text-5xl text-distressed">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-lg text-kaizen-silver">{subtitle}</p>}
          {children}
        </FadeIn>
      </div>
    </section>
  );
}
