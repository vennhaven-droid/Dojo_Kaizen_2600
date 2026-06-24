import { COACHES_TEAM, LOGO_SRC, MARKETING_IMAGES } from "@/lib/brand";
import type { SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_BANNERS = {
  about: MARKETING_IMAGES.about,
  coaches: MARKETING_IMAGES.coaches,
  contact: MARKETING_IMAGES.facility,
  programs: MARKETING_IMAGES.programs,
  pricing: MARKETING_IMAGES.programs,
  schedule: MARKETING_IMAGES.hero,
  enroll: MARKETING_IMAGES.programs,
  facility: MARKETING_IMAGES.facility,
} as const;

export const DEFAULT_GALLERY = MARKETING_IMAGES.gallery.map((url, i) => ({
  title: `Training ${i + 1}`,
  image_url: url,
  sort_order: i + 1,
}));

export async function bootstrapCmsMedia(supabase: SupabaseClient) {
  const { count: galleryCount } = await supabase
    .from("cms_gallery")
    .select("*", { count: "exact", head: true });

  if (!galleryCount) {
    await supabase.from("cms_gallery").insert(
      DEFAULT_GALLERY.map((item) => ({
        ...item,
        category: "general",
        is_published: true,
      }))
    );
  }

  const { data: settings } = await supabase.from("site_settings").select("id, logo_url").limit(1).single();
  if (settings && !settings.logo_url) {
    await supabase.from("site_settings").update({ logo_url: LOGO_SRC }).eq("id", settings.id);
  }

  const { data: homePage } = await supabase.from("cms_pages").select("sections").eq("slug", "home").single();
  if (homePage) {
    const existing = (homePage.sections ?? {}) as Record<string, unknown>;
    const hero = (existing.hero ?? {}) as Record<string, string>;
    await supabase
      .from("cms_pages")
      .update({
        sections: {
          ...existing,
          hero: { ...hero, imageUrl: hero.imageUrl ?? MARKETING_IMAGES.hero },
          kaizenWayImageUrl: existing.kaizenWayImageUrl ?? MARKETING_IMAGES.kaizenWay,
          programHighlights: existing.programHighlights ?? [...MARKETING_IMAGES.programHighlights],
          banners: { ...DEFAULT_BANNERS, ...(existing.banners as Record<string, string> | undefined) },
        },
        updated_at: new Date().toISOString(),
      })
      .eq("slug", "home");
  }

  const { count: coachCount } = await supabase
    .from("coaches")
    .select("*", { count: "exact", head: true });

  if (!coachCount) {
    await supabase.from("coaches").insert(
      COACHES_TEAM.map((coach, i) => ({
        display_name: coach.name,
        bio: coach.bio,
        photo_url: MARKETING_IMAGES.coachPlaceholder,
        is_active: true,
        sort_order: i + 1,
        profile_id: null,
      }))
    );
  }
}

async function mergeHomeSections(
  supabase: SupabaseClient,
  patch: Record<string, unknown>
) {
  const { data: homePage } = await supabase.from("cms_pages").select("sections").eq("slug", "home").single();
  const existing = (homePage?.sections ?? {}) as Record<string, unknown>;
  await supabase
    .from("cms_pages")
    .update({
      sections: { ...existing, ...patch },
      updated_at: new Date().toISOString(),
    })
    .eq("slug", "home");
}

export async function setHomeSectionField(
  supabase: SupabaseClient,
  key: string,
  value: unknown
) {
  const { data: homePage } = await supabase.from("cms_pages").select("sections").eq("slug", "home").single();
  const existing = (homePage?.sections ?? {}) as Record<string, unknown>;
  await mergeHomeSections(supabase, { [key]: value });
  void existing;
}

export async function setHomeBanner(
  supabase: SupabaseClient,
  slug: string,
  url: string
) {
  const { data: homePage } = await supabase.from("cms_pages").select("sections").eq("slug", "home").single();
  const existing = (homePage?.sections ?? {}) as Record<string, unknown>;
  const banners = { ...(existing.banners as Record<string, string> | undefined), [slug]: url };
  await mergeHomeSections(supabase, { banners });
}

export async function setProgramHighlight(
  supabase: SupabaseClient,
  index: number,
  url: string
) {
  const { data: homePage } = await supabase.from("cms_pages").select("sections").eq("slug", "home").single();
  const existing = (homePage?.sections ?? {}) as Record<string, unknown>;
  const highlights = [...(Array.isArray(existing.programHighlights) ? (existing.programHighlights as string[]) : [...MARKETING_IMAGES.programHighlights])];
  highlights[index] = url;
  await mergeHomeSections(supabase, { programHighlights: highlights });
}
