import { getPageBanner } from "@/lib/cms";
import { ContactForm } from "@/components/marketing/contact-form";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Contact",
  "Contact Dojo Kaizen 2600 in Baguio City — phone, location, and inquiry form."
);

export default async function ContactPage() {
  const bannerUrl = await getPageBanner("contact");
  return <ContactForm bannerUrl={bannerUrl} />;
}
