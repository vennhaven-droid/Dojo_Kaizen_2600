import { MarketingHeader, MarketingFooter } from "@/components/marketing/site-chrome";
import { BRAND } from "@/lib/brand";
import { getHomeSections, getLogoUrl } from "@/lib/cms";
import { SITE_URL } from "@/lib/seo";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [logoUrl, homeSections] = await Promise.all([getLogoUrl(), getHomeSections()]);
  const heroImage = homeSections.hero.imageUrl ?? "/images/Home/hero.jpg";

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: BRAND.name,
    description: "Muay Thai, MMA, Boxing and kids martial arts academy in Baguio City.",
    url: SITE_URL,
    telephone: BRAND.phoneTel,
    email: BRAND.email,
    image: `${SITE_URL}${heroImage}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Lower General Luna",
      addressLocality: "Baguio City",
      postalCode: "2600",
      addressCountry: "PH",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "05:00",
      closes: "22:00",
    },
    sameAs: [BRAND.facebook, BRAND.instagram],
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden marketing-gradient">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <MarketingHeader logoUrl={logoUrl} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <MarketingFooter logoUrl={logoUrl} />
    </div>
  );
}
