import { CoachCard } from "@/components/marketing/coach-card";
import { StaggerChildren, StaggerItem } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
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
        <div className="mx-auto max-w-5xl">
          <StaggerChildren className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            {COACHES_TEAM.map((coach, i) => (
              <StaggerItem key={`${coach.name}-${i}`} className="h-full">
                <CoachCard
                  name={coach.name}
                  role={coach.role}
                  bio={coach.bio}
                  imageSrc={MARKETING_IMAGES.coachPlaceholder}
                />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </>
  );
}
