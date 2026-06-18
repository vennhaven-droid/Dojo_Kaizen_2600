import { StaggerChildren, StaggerItem } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { COACHES_TEAM, MARKETING_IMAGES } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Coaches",
  "Meet the Kaizen team — experienced martial arts coaches at Dojo Kaizen 2600 Baguio."
);

export default function CoachesPage() {
  return (
    <>
      <PageBanner
        title="The Kaizen Team"
        subtitle="Experienced fighters and certified instructors guiding your journey."
        imageUrl={MARKETING_IMAGES.coaches}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <StaggerChildren className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {COACHES_TEAM.map((coach, i) => (
              <StaggerItem key={`${coach.name}-${i}`}>
                <article className="group overflow-hidden rounded-xl border border-blue/30 bg-kaizen-dark text-center transition-all hover:border-gold/40 hover:shadow-xl hover:shadow-kaizen-red/10 hover:-translate-y-1">
                  <div className="relative mx-auto aspect-[3/4] max-h-56 w-full overflow-hidden">
                    <MarketingImage
                      src={MARKETING_IMAGES.coachPlaceholder}
                      alt={coach.name}
                      fill
                      className="opacity-70 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-kaizen-dark via-transparent to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-bold text-gold">{coach.name}</h3>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </>
  );
}
