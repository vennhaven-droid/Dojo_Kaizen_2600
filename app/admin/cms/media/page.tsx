import Link from "next/link";
import { getCmsPageAdmin, getCmsGalleryAdmin, getHomeSections, getLogoUrl } from "@/lib/cms";
import { MARKETING_IMAGES } from "@/lib/brand";
import {
  updateHeroImageAction,
  addGalleryImageAction,
  deleteGalleryImageAction,
  updateGalleryImageAction,
  updateLogoAction,
  updateKaizenWayImageAction,
  updateProgramHighlightAction,
  updatePageBannerAction,
  syncDefaultMediaAction,
} from "../actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BANNER_LABELS: { key: string; label: string }[] = [
  { key: "about", label: "About page banner" },
  { key: "coaches", label: "Coaches page banner" },
  { key: "contact", label: "Contact page banner" },
  { key: "programs", label: "Programs page banner" },
  { key: "pricing", label: "Pricing page banner" },
  { key: "schedule", label: "Schedule page banner" },
  { key: "enroll", label: "Enroll page banner" },
];

export default async function CmsMediaPage() {
  const [homePage, gallery, sections, logoUrl] = await Promise.all([
    getCmsPageAdmin("home"),
    getCmsGalleryAdmin(),
    getHomeSections(),
    getLogoUrl(),
  ]);

  const hero = ((homePage?.sections ?? {}) as Record<string, unknown>).hero as Record<string, string> ?? {};
  const programHighlights = sections.programHighlights;
  const banners = sections.banners;

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/cms" className="text-sm text-blue hover:underline">← Website CMS</Link>
        <h2 className="mt-2 font-display text-2xl font-bold">Media &amp; Photos</h2>
        <p className="text-sm text-kaizen-muted">
          Click a photo to replace it. These images appear on the public website.
        </p>
        {gallery.length === 0 && (
          <form action={syncDefaultMediaAction} className="mt-4">
            <Button type="submit" variant="outline" size="sm">
              Import website photos &amp; coaches
            </Button>
          </form>
        )}
      </div>

      <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <ImageUploadField
          label="Site logo (header, footer, hero)"
          defaultUrl={logoUrl}
          action={updateLogoAction}
          shape="circle"
        />
      </section>

      <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <ImageUploadField
          label="Homepage hero background"
          defaultUrl={hero.imageUrl ?? MARKETING_IMAGES.hero}
          action={updateHeroImageAction}
          shape="wide"
        />
      </section>

      <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <ImageUploadField
          label="Kaizen Way section image (homepage)"
          defaultUrl={sections.kaizenWayImageUrl}
          action={updateKaizenWayImageAction}
          shape="square"
        />
      </section>

      <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-6">
        <h3 className="font-display text-lg text-gold">Program highlight carousel (homepage)</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {programHighlights.map((url, i) => (
            <ImageUploadField
              key={i}
              label={`Slide ${i + 1}`}
              defaultUrl={url}
              action={updateProgramHighlightAction}
              shape="square"
              hiddenFields={{ index: String(i) }}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-6">
        <h3 className="font-display text-lg text-gold">Page banners</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          {BANNER_LABELS.map(({ key, label }) => (
            <ImageUploadField
              key={key}
              label={label}
              defaultUrl={banners[key] ?? MARKETING_IMAGES.hero}
              action={updatePageBannerAction}
              shape="wide"
              hiddenFields={{ banner: key }}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-6">
        <h3 className="font-display text-lg text-gold">Training gallery (homepage marquee)</h3>
        <form action={addGalleryImageAction} className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input name="title" placeholder="Gallery photo" />
          </div>
          <div className="space-y-1.5">
            <Label>Image file</Label>
            <Input name="file" type="file" accept="image/*" required />
          </div>
          <Button type="submit" variant="gold">Add to gallery</Button>
        </form>
        {gallery.length === 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MARKETING_IMAGES.gallery.map((url, i) => (
              <div key={url} className="overflow-hidden rounded-lg border border-blue/20 border-dashed p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Fallback ${i + 1}`} className="aspect-square w-full object-cover opacity-60" />
                <p className="mt-1 text-center text-xs text-kaizen-muted">Not in CMS yet</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {gallery.map((item) => (
              <div key={item.id} className="space-y-2">
                <ImageUploadField
                  label={item.title ?? "Gallery photo"}
                  defaultUrl={item.image_url}
                  action={updateGalleryImageAction.bind(null, item.id)}
                  shape="square"
                />
                <form action={deleteGalleryImageAction.bind(null, item.id)}>
                  <Button type="submit" size="sm" variant="ghost" className="w-full text-red-400">
                    Remove
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-sm text-kaizen-muted">
        Coach photos: edit under <Link href="/admin/coaches" className="text-blue hover:underline">Coaches → Edit</Link>.
      </p>
    </div>
  );
}
