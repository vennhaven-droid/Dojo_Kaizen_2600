import Link from "next/link";
import { getCmsPricing, getPageBanner, getPricingPageCms } from "@/lib/cms";
import { buildPricingPageSections, type PricingTier } from "@/lib/pricing";
import { BRAND } from "@/lib/brand";
import { formatPeso } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Pricing",
  "Dojo Kaizen 2600 rates — group classes from ₱250 walk-in, unlimited monthly ₱3,500, private coaching packages."
);

function RateList({ tiers }: { tiers: PricingTier[] }) {
  return (
    <ul className="space-y-3">
      {tiers.map((tier) => (
        <li
          key={tier.id ?? tier.title}
          className={`flex items-center justify-between gap-4 border-b border-blue/10 pb-3 last:border-0 last:pb-0 ${
            tier.is_promoted ? "text-gold" : ""
          }`}
        >
          <span className="font-medium text-kaizen-silver">
            {tier.title}
            {tier.is_promoted && (
              <Badge variant="gold" className="ml-2 align-middle text-xs">
                Popular
              </Badge>
            )}
          </span>
          <span className="shrink-0 font-display text-lg font-bold text-gold">
            {formatPeso(Number(tier.price))}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function PricingPage() {
  const [tiers, bannerUrl, pricingCms] = await Promise.all([
    getCmsPricing(),
    getPageBanner("pricing"),
    getPricingPageCms(),
  ]);
  const sections = buildPricingPageSections(tiers, pricingCms);

  return (
    <>
      <PageBanner title="Pricing" subtitle="Dojo Kaizen 2600 — training rates" imageUrl={bannerUrl} />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <h2 className="text-center font-display text-2xl font-bold text-gold sm:text-3xl">
              DOJO KAIZEN 2600 – RATES
            </h2>
          </FadeIn>

          <div className="mt-12 space-y-10">
            {/* Category 1: Group Classes */}
            <FadeIn>
              <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 sm:p-8">
                <h3 className="font-display text-lg font-bold text-gold sm:text-xl">
                  {sections.groupClasses.label}
                </h3>
                <div className="mt-6">
                  <RateList tiers={sections.groupClasses.tiers} />
                </div>
              </section>
            </FadeIn>

            {/* Category 2: Private Classes (parent) with nested subsections */}
            <FadeIn delay={0.08}>
              <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 sm:p-8">
                <h3 className="font-display text-lg font-bold text-gold sm:text-xl">
                  {sections.privateClasses.label}
                </h3>
                <div className="mt-8 space-y-8">
                  {sections.privateClasses.subsections.map((sub) => (
                    <div
                      key={sub.category}
                      className="rounded-lg border border-blue/15 bg-kaizen-black/40 p-5 sm:p-6"
                    >
                      <h4 className="font-display text-base font-semibold text-kaizen-silver sm:text-lg">
                        {sub.label}
                      </h4>
                      {sub.note && (
                        <p className="mt-2 text-sm italic text-kaizen-muted">{sub.note}</p>
                      )}
                      <div className="mt-4">
                        <RateList tiers={sub.tiers} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </FadeIn>

            {/* Category 4: Custom / Contact */}
            <FadeIn delay={0.16}>
              <section className="rounded-xl border border-gold/30 bg-gold/5 p-6 text-center sm:p-8">
                <h3 className="font-display text-lg font-bold text-gold sm:text-xl">
                  {sections.customCta.title}
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-kaizen-silver sm:text-base">
                  {sections.customCta.description}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild variant="gold">
                    <a href={`tel:${BRAND.phoneTel}`}>Call {BRAND.phone}</a>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </section>
            </FadeIn>
          </div>

          <FadeIn delay={0.24}>
            <div className="mt-12 text-center">
              <Button asChild variant="gold" size="lg">
                <Link href="/enroll">Enroll Now</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
