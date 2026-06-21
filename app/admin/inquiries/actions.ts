"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions-server";
import type { InquiryStatus } from "@/lib/types";

export async function updateInquiry(id: string, formData: FormData) {
  await requirePermission("manage_inquiries");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { error } = await supabase
    .from("contact_inquiries")
    .update({
      status: String(formData.get("status")) as InquiryStatus,
      admin_notes: String(formData.get("admin_notes") || "") || null,
      assigned_to: String(formData.get("assigned_to") || "") || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/inquiries");
}
