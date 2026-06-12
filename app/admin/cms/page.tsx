import { getCmsPage, getSiteSettings, getCmsTestimonials } from "@/lib/cms";
import { updateHomeHero, updateSiteSettings } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function CmsPage() {
  const [homePage, settings, testimonials] = await Promise.all([
    getCmsPage("home"),
    getSiteSettings(),
    getCmsTestimonials(),
  ]);

  const hero = ((homePage?.sections ?? {}) as Record<string, unknown>).hero as Record<string, string> ?? {};

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">Content Management</h2>

      <form action={updateHomeHero} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-4">
        <h3 className="font-display text-lg text-gold">Homepage Hero</h3>
        <div className="space-y-1.5"><Label>Headline</Label><Input name="headline" defaultValue={hero.headline} /></div>
        <div className="space-y-1.5"><Label>Subheadline</Label><Textarea name="subheadline" defaultValue={hero.subheadline} rows={3} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Primary CTA</Label><Input name="primaryCta" defaultValue={hero.primaryCta} /></div>
          <div className="space-y-1.5"><Label>Secondary CTA</Label><Input name="secondaryCta" defaultValue={hero.secondaryCta} /></div>
        </div>
        <Button type="submit" variant="gold">Save Hero</Button>
      </form>

      <form action={updateSiteSettings} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-4">
        <h3 className="font-display text-lg text-gold">Site Settings & SEO</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Academy Name</Label><Input name="academy_name" defaultValue={settings?.academy_name ?? ""} /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input name="phone" defaultValue={settings?.phone ?? ""} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input name="email" defaultValue={settings?.email ?? ""} /></div>
          <div className="space-y-1.5"><Label>Address</Label><Input name="address" defaultValue={settings?.address ?? ""} /></div>
          <div className="space-y-1.5"><Label>Facebook URL</Label><Input name="facebook_url" defaultValue={settings?.facebook_url ?? ""} /></div>
          <div className="space-y-1.5"><Label>Messenger URL</Label><Input name="messenger_url" defaultValue={settings?.messenger_url ?? ""} /></div>
        </div>
        <div className="space-y-1.5"><Label>SEO Title</Label><Input name="seo_title" defaultValue={settings?.seo_title ?? ""} /></div>
        <div className="space-y-1.5"><Label>SEO Description</Label><Textarea name="seo_description" defaultValue={settings?.seo_description ?? ""} rows={2} /></div>
        <Button type="submit" variant="gold">Save Settings</Button>
      </form>

      <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <h3 className="font-display text-lg text-gold mb-4">Testimonials ({testimonials.length})</h3>
        <p className="text-sm text-kaizen-muted">Testimonials are managed via database seed or direct Supabase edits in MVP.</p>
      </div>
    </div>
  );
}
