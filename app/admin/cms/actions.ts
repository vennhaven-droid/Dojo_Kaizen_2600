"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/access";

export async function updateCmsPage(slug: string, sections: Record<string, unknown>) {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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
  revalidatePath("/success");
}

export async function createProgramAction(formData: FormData) {
  await requireAdmin();
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
    default_price: Number(formData.get("default_price") || 0),
  });

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}

export async function createCompetitionAction(formData: FormData) {
  await requireAdmin();
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
