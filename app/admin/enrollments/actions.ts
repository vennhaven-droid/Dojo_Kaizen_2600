"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions-server";

export async function updateEnrollmentLead(id: string, formData: FormData) {
  await requirePermission("manage_enrollments");
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { error } = await supabase
    .from("enrollment_leads")
    .update({
      status: String(formData.get("status")),
      notes: String(formData.get("notes") || "") || null,
      assigned_to: String(formData.get("assigned_to") || "") || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/enrollments");
}
