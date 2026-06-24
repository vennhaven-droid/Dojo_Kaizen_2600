import { createClient } from "@/lib/supabase/server";
import {
  COACHES_TEAM,
  FALLBACK_PRICING,
  LOGO_SRC,
  MARKETING_IMAGES,
} from "@/lib/brand";

export type HomeSections = {
  hero: Record<string, string>;
  about_preview: Record<string, string>;
  kaizenWayImageUrl: string;
  programHighlights: string[];
  banners: Record<string, string>;
};

export type BannerSlug =
  | "about"
  | "coaches"
  | "contact"
  | "programs"
  | "pricing"
  | "schedule"
  | "enroll"
  | "facility";

const DEFAULT_BANNERS: Record<BannerSlug, string> = {
  about: MARKETING_IMAGES.about,
  coaches: MARKETING_IMAGES.coaches,
  contact: MARKETING_IMAGES.facility,
  programs: MARKETING_IMAGES.programs,
  pricing: MARKETING_IMAGES.programs,
  schedule: MARKETING_IMAGES.hero,
  enroll: MARKETING_IMAGES.programs,
  facility: MARKETING_IMAGES.facility,
};

export function coachDisplayName(coach: {
  display_name?: string | null;
  profiles?: { first_name?: string; last_name?: string } | { first_name?: string; last_name?: string }[] | null;
}): string {
  if (coach.display_name) return coach.display_name;
  const profile = Array.isArray(coach.profiles) ? coach.profiles[0] : coach.profiles;
  const name = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
  return name || "Coach";
}

export async function getSiteSettings() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.from("site_settings").select("*").limit(1).single();
  return data;
}

export async function getLogoUrl(): Promise<string> {
  const settings = await getSiteSettings();
  return settings?.logo_url ?? LOGO_SRC;
}

export async function getCmsPage(slug: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("cms_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data;
}

export async function getCmsPageAdmin(slug: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.from("cms_pages").select("*").eq("slug", slug).single();
  return data;
}

export async function getHomeSections(): Promise<HomeSections> {
  const page = await getCmsPage("home");
  const raw = (page?.sections ?? {}) as Record<string, unknown>;
  const hero = (raw.hero ?? {}) as Record<string, string>;
  const about_preview = (raw.about_preview ?? {}) as Record<string, string>;
  const programHighlights = Array.isArray(raw.programHighlights)
    ? (raw.programHighlights as string[])
    : [...MARKETING_IMAGES.programHighlights];
  const bannersRaw = (raw.banners ?? {}) as Record<string, string>;

  return {
    hero,
    about_preview,
    kaizenWayImageUrl: String(raw.kaizenWayImageUrl ?? MARKETING_IMAGES.kaizenWay),
    programHighlights,
    banners: {
      ...DEFAULT_BANNERS,
      ...bannersRaw,
    },
  };
}

export async function getPageBanner(slug: BannerSlug): Promise<string> {
  const sections = await getHomeSections();
  return sections.banners[slug] ?? DEFAULT_BANNERS[slug];
}

export async function getCmsPrograms() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("cms_programs")
    .select("*, programs(*)")
    .eq("is_published", true)
    .order("sort_order");
  if (data && data.length > 0) return data;
  const { data: programs } = await supabase
    .from("programs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (programs ?? []).map((p) => ({
    id: p.id,
    title: p.name,
    description: p.description,
    programs: p,
    sort_order: p.sort_order,
  }));
}

export async function getCmsPricing() {
  const supabase = await createClient();
  if (!supabase) return [...FALLBACK_PRICING];
  const { data } = await supabase
    .from("cms_pricing")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (!data?.length) return [...FALLBACK_PRICING];
  return data;
}

export async function getCmsTestimonials() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("cms_testimonials")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return data ?? [];
}

export async function getCmsEvents() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("cms_events")
    .select("*")
    .eq("is_published", true)
    .order("event_date");
  return data ?? [];
}

export async function getCmsGallery() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("cms_gallery")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return data ?? [];
}

export async function getCmsGalleryAdmin() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from("cms_gallery").select("*").order("sort_order");
  return data ?? [];
}

export async function getGalleryImageUrls(): Promise<string[]> {
  const gallery = await getCmsGallery();
  if (gallery.length > 0) {
    return gallery.map((item) => item.image_url);
  }
  return [...MARKETING_IMAGES.gallery];
}

export async function getCoaches() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("coaches")
    .select("*, profiles(first_name, last_name, avatar_url)")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

export async function getAllCoaches() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("coaches")
    .select("*, profiles(first_name, last_name, email, avatar_url)")
    .order("sort_order");
  return data ?? [];
}

/** Public coach list with brand fallback when DB is empty */
export async function getPublicCoaches(): Promise<
  { name: string; bio: string; imageSrc: string }[]
> {
  const dbCoaches = await getCoaches();
  if (dbCoaches.length > 0) {
    return dbCoaches.map((c) => {
      const profile = c.profiles as { first_name?: string; last_name?: string; avatar_url?: string } | null;
      return {
        name: coachDisplayName(c),
        bio: String(c.bio ?? "Martial arts coach at Dojo Kaizen 2600."),
        imageSrc: profile?.avatar_url ?? c.photo_url ?? MARKETING_IMAGES.coachPlaceholder,
      };
    });
  }
  return COACHES_TEAM.map((coach) => ({
    name: coach.name,
    bio: coach.bio,
    imageSrc: MARKETING_IMAGES.coachPlaceholder,
  }));
}

export async function getProgramSchedules() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("program_schedules")
    .select("*, programs(name, slug), coaches(profiles(first_name, last_name))")
    .order("day_of_week")
    .order("start_time");
  return data ?? [];
}

export async function getPrograms() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("programs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}
