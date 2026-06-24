import { PageBanner } from "@/components/marketing/hero-section";
import { ScheduleBoard } from "@/components/marketing/schedule-board";
import { getPageBanner } from "@/lib/cms";
import { getProgramSchedules } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Schedule",
  "Weekly class schedule at Dojo Kaizen 2600 — Muay Thai, MMA, boxing, BJJ, kids classes in Baguio."
);

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function SchedulePage() {
  const [schedules, bannerUrl] = await Promise.all([getProgramSchedules(), getPageBanner("schedule")]);
  const dbEntries =
    schedules.length > 0
      ? schedules.map((s) => {
          const program = s.programs as { name?: string } | null;
          const coach = s.coaches as { profiles?: { first_name?: string; last_name?: string } } | null;
          const coachName = coach?.profiles
            ? `${coach.profiles.first_name ?? ""} ${coach.profiles.last_name ?? ""}`.trim()
            : "Coach TBA";
          return {
            time: String(s.start_time ?? "").slice(0, 5),
            className: program?.name ?? "Class",
            coach: coachName,
            days: DAY_NAMES[s.day_of_week ?? 0] ?? "TBA",
          };
        })
      : undefined;

  return (
    <>
      <PageBanner
        title="Weekly Class Schedule"
        subtitle="Morning fundamentals, kids programs, striking mastery, and evening fight team training."
        imageUrl={bannerUrl}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <ScheduleBoard scheduleEntries={dbEntries} />
        </div>
      </div>
    </>
  );
}
