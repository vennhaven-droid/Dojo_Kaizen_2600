import { CoachCard } from "@/components/marketing/coach-card";
import { StaggerChildren, StaggerItem } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { COACHES_TEAM, MARKETING_IMAGES } from "@/lib/brand";
import { getCoaches } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Coaches",
  "Meet the Kaizen team — experienced martial arts coaches at Dojo Kaizen 2600 Baguio."
);

export default async function CoachesPage() {
  const dbCoaches = await getCoaches();
  const coaches =
    dbCoaches.length > 0
      ? dbCoaches.map((c) => {
          const profile = c.profiles as { first_name?: string; last_name?: string; avatar_url?: string } | null;
          const name = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "Coach";
          return {
            name,
            bio: String(c.bio ?? "Martial arts coach at Dojo Kaizen 2600."),
            imageSrc: profile?.avatar_url ?? c.photo_url ?? MARKETING_IMAGES.coachPlaceholder,
          };
        })
      : COACHES_TEAM.map((coach) => ({
          name: coach.name,
          bio: coach.bio,
          imageSrc: MARKETING_IMAGES.coachPlaceholder,
        }));

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
            {coaches.map((coach, i) => (
              <StaggerItem key={`${coach.name}-${i}`} className="h-full">
                <CoachCard name={coach.name} bio={coach.bio} imageSrc={coach.imageSrc} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </>
  );
}
