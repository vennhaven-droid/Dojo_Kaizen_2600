import { PageBanner } from "@/components/marketing/hero-section";
import { ScheduleBoard } from "@/components/marketing/schedule-board";
import { MARKETING_IMAGES } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Schedule",
  "Weekly class schedule at Dojo Kaizen 2600 — Muay Thai, MMA, boxing, BJJ, kids classes in Baguio."
);

export default function SchedulePage() {
  return (
    <>
      <PageBanner
        title="Weekly Class Schedule"
        subtitle="Morning fundamentals, kids programs, striking mastery, and evening fight team training."
        imageUrl={MARKETING_IMAGES.hero}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <ScheduleBoard />
        </div>
      </div>
    </>
  );
}
