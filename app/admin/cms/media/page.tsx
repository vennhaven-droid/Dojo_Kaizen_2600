import Link from "next/link";
import { getCmsPageAdmin, getCmsGalleryAdmin, getFacilityGalleryAdmin, getHomeSections, getLogoUrl } from "@/lib/cms";
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
  importFacilityPhotosAction,
  addFacilityImageAction,
  deleteFacilityImageAction,
  updateFacilityImageAction,
} from "../actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { AddPhotoCard } from "@/components/admin/add-photo-card";
import { Button } from "@/components/ui/button";

const BANNER_LABELS: { key: string; label: string }[] = [
  { key: "about", label: "About page banner" },
  { key: "facility", label: "Facility page banner" },
  { key: "coaches", label: "Coaches page banner" },
  { key: "contact", label: "Contact page banner" },
  { key: "programs", label: "Programs page banner" },
  { key: "pricing", label: "Pricing page banner" },
  { key: "schedule", label: "Schedule page banner" },
  { key: "enroll", label: "Enroll page banner" },
];

const HIGHLIGHT_LABELS = [
  "Muay Thai",
  "Boxing",
  "MMA",
  "BJJ",
  "Kids",
  "Fitness",
  "Kickboxing",
];

export default async function CmsMediaPage() {
  const [homePage, gallery, facilityGallery, sections, logoUrl] = await Promise.all([
    getCmsPageAdmin("home"),
    getCmsGalleryAdmin(),
    getFacilityGalleryAdmin(),
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
          Tap any photo to replace it, or add new ones — no links or URLs needed. Pick from your phone or computer like Facebook.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {gallery.length === 0 && (
            <form action={syncDefaultMediaAction}>
              <Button type="submit" variant="outline" size="sm">
                Import website photos &amp; coaches
              </Button>
            </form>
          )}
          {facilityGallery.length === 0 && (
            <form action={importFacilityPhotosAction}>
              <Button type="submit" variant="outline" size="sm">
                Import facility photos
              </Button>
            </form>
          )}
          <Link href="/admin/programs">
            <Button type="button" variant="outline" size="sm">
              Program card images →
            </Button>
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <h3 className="mb-4 font-display text-lg text-gold">Logo &amp; Hero</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <ImageUploadField
            label="Site logo (header, footer, hero)"
            defaultUrl={logoUrl}
            action={updateLogoAction}
            shape="circle"
          />
          <ImageUploadField
            label="Homepage hero background"
            defaultUrl={hero.imageUrl ?? MARKETING_IMAGES.hero}
            action={updateHeroImageAction}
            shape="wide"
          />
        </div>
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {programHighlights.map((url, i) => (
            <ImageUploadField
              key={i}
              label={HIGHLIGHT_LABELS[i] ?? `Slide ${i + 1}`}
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
        <p className="text-sm text-kaizen-muted">Tap a photo to change it, or use Add photo to upload a new one.</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((item) => (
            <div key={item.id} className="space-y-2">
              <ImageUploadField
                label={item.title ?? "Gallery photo"}
                defaultUrl={item.image_url}
                action={updateGalleryImageAction.bind(null, item.id)}
                shape="square"
              />
              <form action={deleteGalleryImageAction.bind(null, item.id)}>
                <Button type="submit" size="sm" variant="ghost" className="w-full min-h-10 text-red-400">
                  Remove
                </Button>
              </form>
            </div>
          ))}
          <AddPhotoCard
            label="Add to gallery"
            action={addGalleryImageAction}
            hiddenFields={{ category: "general" }}
          />
        </div>
        {gallery.length === 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MARKETING_IMAGES.gallery.map((url, i) => (
              <div key={url} className="overflow-hidden rounded-lg border border-blue/20 border-dashed p-2 opacity-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Fallback ${i + 1}`} className="aspect-square w-full object-cover" />
                <p className="mt-1 text-center text-xs text-kaizen-muted">Use Add photo or Import</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="facility" className="rounded-xl border border-gold/30 bg-gold/5 p-6 space-y-6">
        <div>
          <h3 className="font-display text-lg text-gold">Facility gallery (/facility)</h3>
          <p className="mt-1 text-sm text-kaizen-muted">
            Tap any photo to replace it, or add new ones. No URLs — just select from your device.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {facilityGallery.map((item) => (
            <div key={item.id} className="space-y-2">
              <ImageUploadField
                label={item.title ?? "Facility photo"}
                defaultUrl={item.image_url}
                action={updateFacilityImageAction.bind(null, item.id)}
                shape="square"
              />
              <form action={deleteFacilityImageAction.bind(null, item.id)}>
                <Button type="submit" size="sm" variant="ghost" className="w-full min-h-10 text-red-400">
                  Remove
                </Button>
              </form>
            </div>
          ))}
          <AddPhotoCard label="Add facility photo" action={addFacilityImageAction} />
        </div>
        {facilityGallery.length === 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MARKETING_IMAGES.facilityGallery.slice(0, 8).map((url, i) => (
              <div key={url} className="overflow-hidden rounded-lg border border-blue/20 border-dashed p-2 opacity-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Facility ${i + 1}`} className="aspect-square w-full object-cover" />
                <p className="mt-1 text-center text-xs text-kaizen-muted">Use Add photo or Import</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-sm text-kaizen-muted">
        Coach photos: edit under <Link href="/admin/coaches" className="text-blue hover:underline">Coaches → Edit</Link>.
        Program card images: edit under <Link href="/admin/programs" className="text-blue hover:underline">Programs → Edit</Link>.
      </p>
    </div>
  );
}
