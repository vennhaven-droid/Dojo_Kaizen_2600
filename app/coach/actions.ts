"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/server";

export async function coachTimeIn() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Unauthorized");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { data: coach } = await supabase.from("coaches").select("id").eq("profile_id", profile.id).single();
  if (!coach) throw new Error("Coach profile not found");

  await supabase.from("coach_time_logs").insert({
    coach_id: coach.id,
    time_in: new Date().toISOString(),
  });

  revalidatePath("/coach");
}

export async function coachTimeOut(logId: string) {
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  await supabase
    .from("coach_time_logs")
    .update({ time_out: new Date().toISOString() })
    .eq("id", logId);

  revalidatePath("/coach/time");
}

export async function createSessionPlan(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Unauthorized");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { data: coach } = await supabase.from("coaches").select("id").eq("profile_id", profile.id).single();
  if (!coach) throw new Error("Coach profile not found");

  await supabase.from("session_plans").insert({
    coach_id: coach.id,
    topic: String(formData.get("topic")),
    techniques: String(formData.get("techniques") || "") || null,
    conditioning: String(formData.get("conditioning") || "") || null,
    sparring: String(formData.get("sparring") || "") || null,
    notes: String(formData.get("notes") || "") || null,
  });

  revalidatePath("/coach/plans");
}

export async function createStudentNote(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Unauthorized");

  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { data: coach } = await supabase.from("coaches").select("id").eq("profile_id", profile.id).single();
  if (!coach) throw new Error("Coach profile not found");

  await supabase.from("student_notes").insert({
    coach_id: coach.id,
    student_id: String(formData.get("student_id")),
    note: String(formData.get("note")),
    category: String(formData.get("category") || "progress"),
  });

  revalidatePath("/coach/students");
}

export async function adminCheckInStudent(studentId: string) {
  const { adminCheckInAction } = await import("@/app/admin/actions");
  return adminCheckInAction(studentId);
}
