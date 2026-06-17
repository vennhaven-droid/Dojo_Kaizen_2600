import { getCmsEvents } from "@/lib/cms";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { MARKETING_IMAGES } from "@/lib/brand";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Events",
  "Upcoming events, promotions, and announcements at Dojo Kaizen Martial Arts 2600 Baguio."
);

export default async function EventsPage() {
  const events = await getCmsEvents();

  return (
    <>
      <PageBanner title="Events & Announcements" imageUrl={MARKETING_IMAGES.hero} />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6">
          {events.map((e, i) => (
            <FadeIn key={e.id} delay={i * 0.05}>
              <article className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>{e.event_type}</Badge>
                  {e.event_date && (
                    <span className="text-sm text-kaizen-muted">{formatDate(e.event_date)}</span>
                  )}
                </div>
                <h3 className="mt-3 font-display text-xl font-bold text-kaizen-gray">{e.title}</h3>
                <p className="mt-2 text-kaizen-muted">{e.description}</p>
              </article>
            </FadeIn>
          ))}
          </div>
        </div>
      </div>
    </>
  );
}
