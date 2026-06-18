import Link from "next/link";
import { MARKETING_PROGRAMS, MARKETING_IMAGES } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Programs",
  "Muay Thai, MMA, Boxing, kids martial arts, self-defense, fitness conditioning, and private coaching at Dojo Kaizen 2600 Baguio."
);

export default function ProgramsPage() {
  return (
    <>
      <PageBanner
        title="Training Programs"
        subtitle="Muay Thai, MMA, Boxing, kids programs, self-defense, and one-on-one coaching."
        imageUrl={MARKETING_IMAGES.programs}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <StaggerChildren className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {MARKETING_PROGRAMS.map((prog, i) => (
              <StaggerItem key={prog.name}>
                <FadeIn delay={i * 0.05}>
                  <article className="group h-full overflow-hidden rounded-xl border border-blue/30 bg-kaizen-dark transition-all hover:border-gold/40">
                    <div className="relative h-32 overflow-hidden">
                      <MarketingImage
                        src={MARKETING_IMAGES.programs}
                        alt={prog.name}
                        fill
                        className="opacity-60 transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-kaizen-dark to-transparent" />
                      <h2 className="absolute bottom-3 left-3 font-display text-sm font-bold text-gold sm:text-base">{prog.name}</h2>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-kaizen-muted sm:text-sm line-clamp-2">{prog.tagline}</p>
                      <Button asChild variant="gold" size="sm" className="mt-4 w-full">
                        <Link href="/enroll">Enroll Now</Link>
                      </Button>
                    </div>
                  </article>
                </FadeIn>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </>
  );
}
