import { PageBanner } from "@/components/marketing/hero-section";
import { ScheduleBoard } from "@/components/marketing/schedule-board";
import { getPageBanner } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Schedule",
  "Weekly class schedule at Dojo Kaizen 2600 — Muay Thai, MMA, boxing, BJJ, kids classes in Baguio."
);

export default async function SchedulePage() {
  const bannerUrl = await getPageBanner("schedule");

  return (
    <>
      <PageBanner
        title="Weekly Class Schedule"
        subtitle="Morning fundamentals, kids programs, striking mastery, and evening fight team training."
        imageUrl={bannerUrl}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <ScheduleBoard />
        </div>
      </div>
    </>
  );
}
