import Link from "next/link";
import { getPrograms, getCmsPrograms } from "@/lib/cms";
import { formatPeso } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { MARKETING_IMAGES } from "@/lib/brand";

export const metadata = { title: "Programs" };

export default async function ProgramsPage() {
  const [cmsPrograms, programs] = await Promise.all([getCmsPrograms(), getPrograms()]);
  const list = programs.length > 0 ? programs : cmsPrograms.map((p) => (p as { programs?: typeof programs[0] }).programs ?? p);

  return (
    <>
      <PageBanner
        title="Training Programs"
        subtitle="Muay Thai, MMA, Boxing, BJJ, and more — find the perfect program for your goals."
        imageUrl={MARKETING_IMAGES.programs}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            {list.map((p, i) => {
              const prog = p as { id?: string; name?: string; title?: string; description?: string; age_min?: number; age_max?: number; default_price?: number };
              return (
                <FadeIn key={prog.id ?? i} delay={i * 0.05}>
                  <article className="overflow-hidden rounded-xl border border-blue/30 bg-kaizen-dark">
                    <div className="relative h-48">
                      <MarketingImage src={MARKETING_IMAGES.programs} alt={prog.name ?? prog.title ?? "Program"} fill className="opacity-70" />
                      <div className="absolute inset-0 bg-gradient-to-t from-kaizen-dark via-kaizen-dark/40 to-transparent" />
                      <h2 className="absolute bottom-4 left-6 font-display text-2xl font-bold text-gold">{prog.name ?? prog.title}</h2>
                    </div>
                    <div className="p-8">
                      {(prog.age_min || prog.age_max) && (
                        <p className="text-sm text-blue">
                          Ages {prog.age_min ?? "?"}{prog.age_max ? `–${prog.age_max}` : "+"}
                        </p>
                      )}
                      <p className="mt-4 text-kaizen-muted">{prog.description}</p>
                      {prog.default_price != null && (
                        <p className="mt-4 font-display text-xl font-bold text-kaizen-gray">
                          From {formatPeso(Number(prog.default_price))}/mo
                        </p>
                      )}
                      <Button asChild variant="gold" className="mt-6">
                        <Link href="/enroll">Enroll Now</Link>
                      </Button>
                    </div>
                  </article>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
