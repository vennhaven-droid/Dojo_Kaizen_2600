"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/permissions-server";
import { logAudit } from "@/lib/audit";
import { calculateAge } from "@/lib/utils";

export async function createStudent(formData: FormData) {
  const profile = await requirePermission("create_edit_students");
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) throw new Error("Database not configured");

  const birthday = String(formData.get("birthday") || "") || null;
  const age = calculateAge(birthday);
  const loginEmail = String(formData.get("login_email") || "").trim();
  const loginPassword = String(formData.get("login_password") || "");
  let profileId: string | null = null;

  if (loginEmail && loginPassword) {
    const { data: authUser, error } = await admin.auth.admin.createUser({
      email: loginEmail,
      password: loginPassword,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    profileId = authUser.user.id;
    await admin.from("profiles").update({ role: "STUDENT", email: loginEmail }).eq("id", profileId);
  }

  const { data: student, error } = await supabase
    .from("students")
    .insert({
      profile_id: profileId,
      first_name: String(formData.get("first_name")),
      last_name: String(formData.get("last_name")),
      nickname: String(formData.get("nickname") || "") || null,
      birthday,
      gender: String(formData.get("gender") || "") || null,
      email: String(formData.get("email") || loginEmail || "") || null,
      phone: String(formData.get("phone") || "") || null,
      address: String(formData.get("address") || "") || null,
      notes: String(formData.get("notes") || "") || null,
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

  const parentEmail = String(formData.get("parent_email") || "").trim();
  const parentPassword = String(formData.get("parent_password") || "");
  if (parentEmail && parentPassword) {
    const { data: parentAuth, error: parentError } = await admin.auth.admin.createUser({
      email: parentEmail,
      password: parentPassword,
      email_confirm: true,
      user_metadata: {
        first_name: String(formData.get("parent_first_name") || guardian1Name.split(" ")[0] || "Parent"),
        last_name: String(formData.get("parent_last_name") || ""),
      },
    });
    if (parentError) throw new Error(parentError.message);
    await admin.from("profiles").update({ role: "PARENT", email: parentEmail }).eq("id", parentAuth.user.id);
    await supabase.from("parent_students").insert({
      parent_id: parentAuth.user.id,
      student_id: student.id,
    });
  } else {
    const parentId = String(formData.get("parent_id") || "");
    if (parentId) {
      await supabase.from("parent_students").insert({
        parent_id: parentId,
        student_id: student.id,
      });
    }
  }

  const programId = String(formData.get("program_id") || "");
  const membershipType = String(formData.get("membership_type") || "MONTHLY");
  if (programId) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);
    await supabase.from("memberships").insert({
      student_id: student.id,
      program_id: programId,
      type: membershipType,
      status: "ACTIVE",
      start_date: new Date().toISOString().slice(0, 10),
      due_date: dueDate.toISOString().slice(0, 10),
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
  const profile = await requirePermission("create_edit_students");
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
      notes: String(formData.get("notes") || "") || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logAudit({ userId: profile.id, action: "UPDATE", entityType: "student", entityId: id });
  revalidatePath(`/admin/students/${id}`);
  revalidatePath("/admin/students");
}

export async function convertEnrollmentLead(leadId: string) {
  await requirePermission("manage_enrollments");
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
  if (lead.email) {
    fd.set("login_email", lead.email);
    fd.set("login_password", `Kaizen${Math.random().toString(36).slice(2, 10)}!`);
  }
  if (lead.parent_email) {
    fd.set("parent_email", lead.parent_email);
    fd.set("parent_password", `Parent${Math.random().toString(36).slice(2, 10)}!`);
    fd.set("parent_first_name", lead.parent_name ?? "Parent");
  }

  const result = await createStudent(fd);

  await supabase
    .from("enrollment_leads")
    .update({ status: "ENROLLED", notes: `Converted to student ${result.id}` })
    .eq("id", leadId);

  revalidatePath("/admin/enrollments");
  return result;
}
