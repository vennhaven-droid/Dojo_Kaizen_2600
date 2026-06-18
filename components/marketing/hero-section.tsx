import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/marketing/motion";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { BRAND, LOGO_SRC, MARKETING_IMAGES } from "@/lib/brand";

type HeroSectionProps = {
  headline?: string;
  subheadline?: string;
  primaryCta?: string;
  imageUrl?: string;
};

export function HeroSection({
  headline = "TRAIN HARD. IMPROVE EVERYDAY.",
  subheadline = "Muay Thai, MMA, Boxing & Brazilian Jiu-Jitsu in Baguio City. Discipline. Respect. Continuous improvement.",
  primaryCta = "Enroll Now",
  imageUrl = MARKETING_IMAGES.hero,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <div className="absolute inset-0">
        <MarketingImage
          src={imageUrl}
          alt="Dojo Kaizen Martial Arts 2600"
          fill
          priority
          className="scale-105 object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-kaizen-black/70 via-kaizen-black/85 to-kaizen-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(229,57,53,0.12)_0%,_transparent_65%)]" />
        <div className="hero-grain absolute inset-0 opacity-40" />
      </div>

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <FadeIn>
          <div className="mb-8">
            <MarketingImage
              src={LOGO_SRC}
              alt="Dojo Kaizen logo"
              width={180}
              height={180}
              priority
              className="mx-auto rounded-full ring-4 ring-gold/60 shadow-2xl shadow-kaizen-red/30 bg-kaizen-black/80 p-1 object-contain"
            />
          </div>
          <p className="font-hero text-xs font-bold tracking-[0.2em] text-gold sm:tracking-[0.35em]">DOJO KAIZEN 2600</p>
          <h1 className="headline-glow font-hero mt-4 text-3xl font-bold leading-tight text-kaizen-gray text-distressed sm:text-6xl lg:text-7xl">
            {headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl px-1 text-base text-kaizen-silver sm:text-lg">{subheadline}</p>
          <div className="mt-10 flex w-full max-w-sm flex-col items-stretch gap-4 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
            <Button asChild variant="gold" size="lg" className="w-full shadow-lg shadow-gold/20 sm:w-auto sm:min-w-[180px]">
              <Link href="/enroll">{primaryCta}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto sm:min-w-[180px]">
              <Link href="/schedule">View Schedule</Link>
            </Button>
          </div>
          <p className="mt-8 text-sm text-kaizen-muted">{BRAND.location}</p>
        </FadeIn>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-kaizen-red to-transparent" />
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
    <section className="relative overflow-hidden border-b border-kaizen-red/20 py-20 sm:py-28">
      <div className="absolute inset-0">
        <MarketingImage src={imageUrl} alt={title} fill className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-kaizen-black via-kaizen-black/95 to-kaizen-black/85" />
        <div className="hero-grain absolute inset-0 opacity-30" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn>
          <p className="font-display text-xs font-bold tracking-[0.35em] text-gold">DOJO KAIZEN 2600</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-kaizen-gray text-distressed sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-base text-kaizen-silver sm:text-lg">{subtitle}</p>}
          {children}
        </FadeIn>
      </div>
    </section>
  );
}
