"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions-server";
import { uploadMarketingImage } from "../cms/actions";

export async function createMarketingCoachAction(formData: FormData) {
  await requirePermission("manage_coaches");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const displayName = String(formData.get("display_name")).trim();
  if (!displayName) throw new Error("Name is required");

  const { data: maxRow } = await supabase
    .from("coaches")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let photoUrl: string | null = null;
  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const fd = new FormData();
    fd.set("file", file);
    photoUrl = await uploadMarketingImage(fd);
  }

  const { error } = await supabase.from("coaches").insert({
    display_name: displayName,
    bio: String(formData.get("bio") || "") || null,
    photo_url: photoUrl,
    is_active: true,
    sort_order: (maxRow?.sort_order ?? 0) + 1,
    profile_id: null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/coaches");
  revalidatePath("/coaches");
}
