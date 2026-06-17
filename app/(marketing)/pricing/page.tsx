import Link from "next/link";
import { getCmsPricing } from "@/lib/cms";
import { formatPeso } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { MARKETING_IMAGES } from "@/lib/brand";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Pricing",
  "Affordable martial arts memberships in Baguio — Muay Thai from ₱2,500/mo, walk-in ₱300, kids programs & more."
);

export default async function PricingPage() {
  const tiers = await getCmsPricing();

  return (
    <>
      <PageBanner title="Pricing" subtitle="Flexible options for every training style" imageUrl={MARKETING_IMAGES.programs} />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, i) => {
            const features = (tier.features ?? []) as string[];
            return (
              <FadeIn key={tier.id ?? tier.title} delay={i * 0.1}>
                <div className={`relative rounded-xl border p-8 ${tier.is_promoted ? "border-gold/50 bg-gold/5" : "border-blue/20 bg-kaizen-dark"}`}>
                  {tier.is_promoted && <Badge variant="gold" className="absolute -top-3 right-4">Popular</Badge>}
                  <h3 className="font-display text-xl font-bold text-kaizen-gray">{tier.title}</h3>
                  <p className="mt-2 text-sm text-kaizen-muted">{tier.description}</p>
                  <p className="mt-6 font-display text-4xl font-bold text-gold">
                    {formatPeso(Number(tier.price))}
                    <span className="text-sm font-normal text-kaizen-muted">/{tier.billing_period}</span>
                  </p>
                  <ul className="mt-6 space-y-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-kaizen-muted">
                        <span className="text-blue">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant={tier.is_promoted ? "gold" : "secondary"} className="mt-8 w-full">
                    <Link href="/enroll">Get Started</Link>
                  </Button>
                </div>
              </FadeIn>
            );
          })}
          </div>
        </div>
      </div>
    </>
  );
}
