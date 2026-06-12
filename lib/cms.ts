import { createClient } from "@/lib/supabase/server";

export async function getSiteSettings() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.from("site_settings").select("*").limit(1).single();
  return data;
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
  if (!supabase) return [];
  const { data } = await supabase
    .from("cms_pricing")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return data ?? [];
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

export async function getCoaches() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("coaches")
    .select("*, profiles(first_name, last_name, avatar_url)")
    .eq("is_active", true);
  return data ?? [];
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
