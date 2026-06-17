import { getProgramSchedules } from "@/lib/cms";
import { FadeIn } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { MARKETING_IMAGES } from "@/lib/brand";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Schedule",
  "Weekly class schedule at Dojo Kaizen 2600 — Muay Thai, MMA, boxing, kids classes & open mat in Baguio."
);

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function SchedulePage() {
  const schedules = await getProgramSchedules();
  const byDay = DAYS.map((day, i) => ({
    day,
    items: schedules.filter((s) => s.day_of_week === i),
  }));

  return (
    <>
      <PageBanner title="Class Schedule" subtitle="Weekly training schedule at Dojo Kaizen 2600" imageUrl={MARKETING_IMAGES.facility} />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6">
          {byDay.map(({ day, items }) => (
            <div key={day} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
              <h3 className="font-display text-lg font-bold text-gold">{day}</h3>
              {items.length === 0 ? (
                <p className="mt-2 text-sm text-kaizen-muted">No classes scheduled</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {items.map((s) => {
                    const program = s.programs as { name?: string } | null;
                    const coach = s.coaches as { profiles?: { first_name?: string; last_name?: string } } | null;
                    const coachName = coach?.profiles
                      ? `${coach.profiles.first_name ?? ""} ${coach.profiles.last_name ?? ""}`.trim()
                      : "";
                    return (
                      <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="font-semibold text-kaizen-gray">{program?.name}</span>
                        <span className="text-kaizen-muted">
                          {String(s.start_time).slice(0, 5)} – {String(s.end_time).slice(0, 5)}
                          {coachName && ` · ${coachName}`}
                          {s.age_group && ` · ${s.age_group}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
          </div>
        </div>
      </div>
    </>
  );
}
