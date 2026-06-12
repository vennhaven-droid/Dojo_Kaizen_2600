"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/access";
import { logAudit } from "@/lib/audit";
import { calculateAge } from "@/lib/utils";

export async function createStudent(formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const birthday = String(formData.get("birthday") || "") || null;
  const age = calculateAge(birthday);

  const { data: student, error } = await supabase
    .from("students")
    .insert({
      first_name: String(formData.get("first_name")),
      last_name: String(formData.get("last_name")),
      nickname: String(formData.get("nickname") || "") || null,
      birthday,
      gender: String(formData.get("gender") || "") || null,
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      address: String(formData.get("address") || "") || null,
      medical: {
        allergies: String(formData.get("allergies") || ""),
        conditions: String(formData.get("conditions") || ""),
        injuries: String(formData.get("injuries") || ""),
        notes: String(formData.get("medical_notes") || ""),
      },
      status: "ACTIVE",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const guardian1Name = String(formData.get("guardian1_name") || "");
  if (guardian1Name) {
    await supabase.from("guardians").insert({
      student_id: student.id,
      name: guardian1Name,
      relationship: String(formData.get("guardian1_relationship") || "Parent"),
      phone: String(formData.get("guardian1_phone") || "") || null,
      email: String(formData.get("guardian1_email") || "") || null,
      is_primary: true,
    });
  }

  const guardian2Name = String(formData.get("guardian2_name") || "");
  if (guardian2Name) {
    await supabase.from("guardians").insert({
      student_id: student.id,
      name: guardian2Name,
      relationship: String(formData.get("guardian2_relationship") || "Parent"),
      phone: String(formData.get("guardian2_phone") || "") || null,
      email: String(formData.get("guardian2_email") || "") || null,
      is_primary: false,
    });
  }

  if (age !== null && age < 18 && !guardian1Name) {
    throw new Error("Guardian information required for students under 18");
  }

  const emergencyName = String(formData.get("emergency_name") || "");
  if (emergencyName) {
    await supabase.from("emergency_contacts").insert({
      student_id: student.id,
      name: emergencyName,
      relationship: String(formData.get("emergency_relationship") || ""),
      phone: String(formData.get("emergency_phone") || ""),
    });
  }

  const parentId = String(formData.get("parent_id") || "");
  if (parentId) {
    await supabase.from("parent_students").insert({
      parent_id: parentId,
      student_id: student.id,
    });
  }

  await logAudit({
    userId: profile.id,
    action: "CREATE",
    entityType: "student",
    entityId: student.id,
    newValue: { first_name: formData.get("first_name"), last_name: formData.get("last_name") },
  });

  revalidatePath("/admin/students");
  return { id: student.id };
}

export async function updateStudent(id: string, formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { error } = await supabase
    .from("students")
    .update({
      first_name: String(formData.get("first_name")),
      last_name: String(formData.get("last_name")),
      nickname: String(formData.get("nickname") || "") || null,
      birthday: String(formData.get("birthday") || "") || null,
      gender: String(formData.get("gender") || "") || null,
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      address: String(formData.get("address") || "") || null,
      status: String(formData.get("status") || "ACTIVE"),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logAudit({ userId: profile.id, action: "UPDATE", entityType: "student", entityId: id });
  revalidatePath(`/admin/students/${id}`);
  revalidatePath("/admin/students");
}

export async function convertEnrollmentLead(leadId: string) {
  const profile = await requireAdmin();
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { data: lead } = await supabase
    .from("enrollment_leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (!lead) throw new Error("Lead not found");

  const fd = new FormData();
  fd.set("first_name", lead.first_name);
  fd.set("last_name", lead.last_name);
  fd.set("birthday", lead.birthday ?? "");
  fd.set("email", lead.email ?? "");
  fd.set("phone", lead.phone ?? "");
  fd.set("guardian1_name", lead.parent_name ?? "");
  fd.set("guardian1_phone", lead.parent_phone ?? "");

  const result = await createStudent(fd);

  await supabase
    .from("enrollment_leads")
    .update({ status: "converted", notes: `Converted to student ${result.id}` })
    .eq("id", leadId);

  revalidatePath("/admin/enrollments");
  return result;
}
