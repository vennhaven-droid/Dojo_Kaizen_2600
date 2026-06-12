import { getCoaches } from "@/lib/cms";
import { FadeIn } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { MARKETING_IMAGES } from "@/lib/brand";

export const metadata = { title: "Coaches" };

export default async function CoachesPage() {
  const coaches = await getCoaches();

  return (
    <>
      <PageBanner
        title="Our Coaches"
        subtitle="Experienced fighters and certified instructors guiding your journey."
        imageUrl={MARKETING_IMAGES.coaches}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {coaches.length === 0 ? (
            <div className="grid gap-8 lg:grid-cols-2">
              <FadeIn>
                <div className="relative aspect-square max-w-sm overflow-hidden rounded-2xl ring-2 ring-gold/30">
                  <MarketingImage src={MARKETING_IMAGES.coaches} alt="Dojo Kaizen training" fill />
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="text-lg text-kaizen-silver">
                  Coach profiles coming soon. Visit our{" "}
                  <a href="https://www.facebook.com/profile.php?id=100084453027782" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                    Facebook page
                  </a>{" "}
                  to meet the team and see training in action.
                </p>
              </FadeIn>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {coaches.map((c, i) => {
                const profile = c.profiles as { first_name?: string; last_name?: string } | null;
                const name = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
                return (
                  <FadeIn key={c.id} delay={i * 0.1}>
                    <div className="overflow-hidden rounded-xl border border-blue/30 bg-kaizen-dark">
                      <div className="relative h-40">
                        <MarketingImage src={c.photo_url ?? MARKETING_IMAGES.coaches} alt={name} fill />
                      </div>
                      <div className="p-6">
                        <h3 className="font-display text-xl font-bold text-gold">{name || "Coach"}</h3>
                        <p className="mt-2 text-sm text-kaizen-muted line-clamp-4">{c.bio ?? c.experience}</p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
