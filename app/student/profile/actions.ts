"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getStudentForUser } from "@/lib/access";

export async function updateStudentProfile(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Unauthorized");

  const student = await getStudentForUser(profile.id);
  if (!student) throw new Error("Student not found");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const fields = [
    { key: "phone", value: String(formData.get("phone") || "") || null },
    { key: "birthday", value: String(formData.get("birthday") || "") || null },
    { key: "address", value: String(formData.get("address") || "") || null },
  ] as const;

  const updates: Record<string, string | null> = {};
  for (const f of fields) {
    const oldVal = String((student as Record<string, unknown>)[f.key] ?? "");
    if (oldVal !== String(f.value ?? "")) {
      updates[f.key] = f.value;
      await supabase.from("student_profile_changes").insert({
        student_id: student.id,
        changed_by: profile.id,
        field_name: f.key,
        old_value: oldVal || null,
        new_value: String(f.value ?? "") || null,
      });
    }
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("students").update(updates).eq("id", student.id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/student/profile");
}
