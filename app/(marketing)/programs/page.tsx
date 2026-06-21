import { MARKETING_PROGRAMS, MARKETING_IMAGES } from "@/lib/brand";
import { getCmsPrograms } from "@/lib/cms";
import { ProgramCard } from "@/components/marketing/program-card";
import { StaggerChildren, StaggerItem } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Programs",
  "Muay Thai, MMA, Boxing, kids martial arts, self-defense, fitness conditioning, and private coaching at Dojo Kaizen 2600 Baguio."
);

export default async function ProgramsPage() {
  const cmsPrograms = await getCmsPrograms();
  const programs =
    cmsPrograms.length > 0
      ? cmsPrograms.map((p) => ({
          name: String(p.title ?? (p.programs as { name?: string } | null)?.name ?? "Program"),
          tagline: String(p.description ?? (p.programs as { description?: string } | null)?.description ?? ""),
        }))
      : MARKETING_PROGRAMS;

  return (
    <>
      <PageBanner
        title="Training Programs"
        subtitle="Muay Thai, MMA, Boxing, kids programs, self-defense, and one-on-one coaching."
        imageUrl={MARKETING_IMAGES.programs}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <StaggerChildren className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((prog) => (
              <StaggerItem key={prog.name} className="h-full">
                <ProgramCard name={prog.name} tagline={prog.tagline} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </>
  );
}
