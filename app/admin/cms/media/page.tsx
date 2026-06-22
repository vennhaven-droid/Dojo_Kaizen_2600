import Link from "next/link";
import { getCmsPage, getCmsGallery } from "@/lib/cms";
import {
  updateHeroImageAction,
  addGalleryImageAction,
  deleteGalleryImageAction,
} from "../actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function CmsMediaPage() {
  const [homePage, gallery] = await Promise.all([getCmsPage("home"), getCmsGallery()]);
  const hero = ((homePage?.sections ?? {}) as Record<string, unknown>).hero as Record<string, string> ?? {};

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/cms" className="text-sm text-blue hover:underline">← Website CMS</Link>
        <h2 className="mt-2 font-display text-2xl font-bold">Media &amp; Photos</h2>
        <p className="text-sm text-kaizen-muted">Click a photo to replace it — like Facebook profile change.</p>
      </div>

      <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <ImageUploadField
          label="Homepage hero image"
          defaultUrl={hero.imageUrl}
          action={updateHeroImageAction}
          shape="wide"
        />
      </section>

      <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-6">
        <h3 className="font-display text-lg text-gold">Training gallery</h3>
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gallery.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg border border-blue/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt={item.title ?? ""} className="aspect-square w-full object-cover" />
              <form action={deleteGalleryImageAction.bind(null, item.id)} className="absolute inset-x-0 bottom-0 bg-black/70 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button type="submit" size="sm" variant="ghost" className="w-full text-red-400">
                  Remove
                </Button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm text-kaizen-muted">
        Coach photos: edit under <Link href="/admin/coaches" className="text-blue hover:underline">Coaches → Edit</Link>.
      </p>
    </div>
  );
}
