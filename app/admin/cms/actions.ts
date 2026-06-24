"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions-server";
import {
  bootstrapCmsMedia,
  setHomeBanner,
  setHomeSectionField,
  setProgramHighlight,
} from "@/lib/cms-bootstrap";

export async function updateCmsPage(slug: string, sections: Record<string, unknown>) {
  await requirePermission("manage_content");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { error } = await supabase
    .from("cms_pages")
    .update({ sections, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/${slug === "home" ? "" : slug}`);
}

export async function updateHomeHero(formData: FormData) {
  await requirePermission("manage_content");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { data: homePage } = await supabase.from("cms_pages").select("sections").eq("slug", "home").single();
  const existing = (homePage?.sections ?? {}) as Record<string, unknown>;

  await updateCmsPage("home", {
    ...existing,
    hero: {
      headline: String(formData.get("headline")),
      subheadline: String(formData.get("subheadline")),
      primaryCta: String(formData.get("primaryCta")),
      secondaryCta: String(formData.get("secondaryCta")),
    },
  });
}

export async function updateSiteSettings(formData: FormData) {
  await requirePermission("manage_content");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).single();

  const payload = {
    academy_name: String(formData.get("academy_name")),
    phone: String(formData.get("phone") || "") || null,
    email: String(formData.get("email") || "") || null,
    address: String(formData.get("address") || "") || null,
    facebook_url: String(formData.get("facebook_url") || "") || null,
    messenger_url: String(formData.get("messenger_url") || "") || null,
    seo_title: String(formData.get("seo_title") || "") || null,
    seo_description: String(formData.get("seo_description") || "") || null,
  };

  if (existing) {
    await supabase.from("site_settings").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("site_settings").insert(payload);
  }

  revalidatePath("/");
  revalidatePath("/admin/cms");
}

export async function updateCmsTestimonial(id: string, formData: FormData) {
  await requirePermission("manage_content");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  await supabase
    .from("cms_testimonials")
    .update({
      author_name: String(formData.get("author_name")),
      author_role: String(formData.get("author_role") || "") || null,
      content: String(formData.get("content")),
      rating: Number(formData.get("rating") || 5),
    })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/");
}

export async function createProgramAction(formData: FormData) {
  await requirePermission("manage_programs");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const name = String(formData.get("name"));
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  await supabase.from("programs").insert({
    name,
    slug,
    description: String(formData.get("description") || "") || null,
    age_min: formData.get("age_min") ? Number(formData.get("age_min")) : null,
    age_max: formData.get("age_max") ? Number(formData.get("age_max")) : null,
    sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : 0,
    is_active: formData.get("is_active") !== "off",
  });

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}

export async function updateProgramAction(id: string, formData: FormData) {
  await requirePermission("manage_programs");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { error } = await supabase
    .from("programs")
    .update({
      name: String(formData.get("name")),
      description: String(formData.get("description") || "") || null,
      age_min: formData.get("age_min") ? Number(formData.get("age_min")) : null,
      age_max: formData.get("age_max") ? Number(formData.get("age_max")) : null,
      sort_order: formData.get("sort_order") ? Number(formData.get("sort_order")) : 0,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/programs");
  revalidatePath(`/admin/programs/${id}`);
  revalidatePath("/programs");
}

export async function createPricingTierAction(formData: FormData) {
  await requirePermission("manage_pricing");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const features = String(formData.get("features") || "")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  await supabase.from("cms_pricing").insert({
    title: String(formData.get("title")),
    description: String(formData.get("description") || "") || null,
    price: Number(formData.get("price")),
    billing_period: String(formData.get("billing_period") || "monthly"),
    features,
    is_promoted: formData.get("is_promoted") === "on",
    sort_order: Number(formData.get("sort_order") || 0),
    is_published: formData.get("is_published") !== "off",
  });

  revalidatePath("/admin/pricing");
  revalidatePath("/pricing");
}

export async function updatePricingTierAction(id: string, formData: FormData) {
  await requirePermission("manage_pricing");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const features = String(formData.get("features") || "")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  await supabase
    .from("cms_pricing")
    .update({
      title: String(formData.get("title")),
      description: String(formData.get("description") || "") || null,
      price: Number(formData.get("price")),
      billing_period: String(formData.get("billing_period") || "monthly"),
      features,
      is_promoted: formData.get("is_promoted") === "on",
      sort_order: Number(formData.get("sort_order") || 0),
      is_published: formData.get("is_published") === "on",
    })
    .eq("id", id);

  revalidatePath("/admin/pricing");
  revalidatePath("/pricing");
}

export async function updateCoachAction(coachId: string, formData: FormData) {
  await requirePermission("manage_coaches");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const payload: Record<string, unknown> = {
    bio: String(formData.get("bio") || "") || null,
    experience: String(formData.get("experience") || "") || null,
    photo_url: String(formData.get("photo_url") || "") || null,
    is_active: formData.get("is_active") === "on",
  };
  const displayName = String(formData.get("display_name") || "").trim();
  if (displayName) payload.display_name = displayName;

  const { error } = await supabase.from("coaches").update(payload).eq("id", coachId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/coaches");
  revalidatePath(`/admin/coaches/${coachId}`);
  revalidatePath("/coaches");
}

export async function uploadMarketingImage(formData: FormData) {
  const { uploadMarketingMedia } = await import("@/lib/storage");
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No file provided");
  return uploadMarketingMedia(file);
}

async function uploadMarketingImageWithPermission(formData: FormData) {
  await requirePermission("manage_media");
  return uploadMarketingImage(formData);
}

export async function updateHeroImageAction(formData: FormData) {
  await requirePermission("manage_media");
  const url = await uploadMarketingImageWithPermission(formData);
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { data: homePage } = await supabase.from("cms_pages").select("sections").eq("slug", "home").single();
  const existing = (homePage?.sections ?? {}) as Record<string, unknown>;
  const hero = (existing.hero ?? {}) as Record<string, string>;

  await updateCmsPage("home", {
    ...existing,
    hero: { ...hero, imageUrl: url },
  });
  revalidatePath("/admin/cms/media");
}

export async function addGalleryImageAction(formData: FormData) {
  await requirePermission("manage_media");
  const url = await uploadMarketingImageWithPermission(formData);
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  await supabase.from("cms_gallery").insert({
    title: String(formData.get("title") || "Gallery"),
    image_url: url,
    category: String(formData.get("category") || "general"),
    is_published: true,
  });

  revalidatePath("/admin/cms/media");
  revalidatePath("/");
}

export async function updateCoachPhotoAction(coachId: string, formData: FormData) {
  await requirePermission("manage_coaches");
  const url = await uploadMarketingImage(formData);
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");
  await supabase.from("coaches").update({ photo_url: url }).eq("id", coachId);
  revalidatePath("/admin/coaches");
  revalidatePath(`/admin/coaches/${coachId}`);
  revalidatePath("/coaches");
}

export async function deleteGalleryImageAction(id: string) {
  await requirePermission("manage_media");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");
  await supabase.from("cms_gallery").delete().eq("id", id);
  revalidatePath("/admin/cms/media");
  revalidatePath("/");
}

export async function updateLogoAction(formData: FormData) {
  await requirePermission("manage_media");
  const url = await uploadMarketingImageWithPermission(formData);
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");
  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).single();
  if (existing) {
    await supabase.from("site_settings").update({ logo_url: url }).eq("id", existing.id);
  } else {
    await supabase.from("site_settings").insert({ academy_name: "Dojo Kaizen Martial Arts 2600", logo_url: url });
  }
  revalidatePath("/");
  revalidatePath("/admin/cms/media");
}

export async function updateKaizenWayImageAction(formData: FormData) {
  await requirePermission("manage_media");
  const url = await uploadMarketingImageWithPermission(formData);
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");
  await setHomeSectionField(supabase, "kaizenWayImageUrl", url);
  revalidatePath("/");
  revalidatePath("/admin/cms/media");
}

export async function updateProgramHighlightAction(formData: FormData) {
  await requirePermission("manage_media");
  const url = await uploadMarketingImageWithPermission(formData);
  const index = Number(formData.get("index") ?? 0);
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");
  await setProgramHighlight(supabase, index, url);
  revalidatePath("/");
  revalidatePath("/admin/cms/media");
}

export async function updatePageBannerAction(formData: FormData) {
  await requirePermission("manage_media");
  const url = await uploadMarketingImageWithPermission(formData);
  const slug = String(formData.get("banner") ?? "");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");
  await setHomeBanner(supabase, slug, url);
  revalidatePath("/");
  revalidatePath("/admin/cms/media");
  revalidatePath(`/${slug === "facility" ? "contact" : slug}`);
}

export async function updateGalleryImageAction(galleryId: string, formData: FormData) {
  await requirePermission("manage_media");
  const url = await uploadMarketingImageWithPermission(formData);
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");
  await supabase.from("cms_gallery").update({ image_url: url }).eq("id", galleryId);
  revalidatePath("/admin/cms/media");
  revalidatePath("/");
}

export async function syncDefaultMediaAction() {
  await requirePermission("manage_media");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");
  await bootstrapCmsMedia(supabase);
  revalidatePath("/admin/cms/media");
  revalidatePath("/admin/coaches");
  revalidatePath("/");
  revalidatePath("/coaches");
}

export async function createCompetitionAction(formData: FormData) {
  await requirePermission("view_students");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  await supabase.from("competitions").insert({
    student_id: String(formData.get("student_id")),
    name: String(formData.get("name")),
    date: String(formData.get("date")),
    division: String(formData.get("division") || "") || null,
    weight_class: String(formData.get("weight_class") || "") || null,
    opponent: String(formData.get("opponent") || "") || null,
    result: String(formData.get("result") || "") || null,
    placement: String(formData.get("placement") || "") || null,
    medal: String(formData.get("medal") || "") || null,
    coach_notes: String(formData.get("coach_notes") || "") || null,
  });

  revalidatePath("/admin/competitions");
}
