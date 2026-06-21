"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdminProfile, requirePermission } from "@/lib/permissions-server";
import { ALL_PERMISSION_FLAGS, permissionsFromForm } from "@/lib/permissions";
import type { UserRole } from "@/lib/types";
import { logAudit } from "@/lib/audit";

export async function createStaffAccount(formData: FormData) {
  await requireSuperAdminProfile();
  const admin = createAdminClient();
  if (!admin) throw new Error("Database not configured");

  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));
  const firstName = String(formData.get("first_name")).trim();
  const lastName = String(formData.get("last_name")).trim();
  const role = String(formData.get("role")) as UserRole;

  if (!["ADMIN", "COACH"].includes(role)) {
    throw new Error("Staff role must be ADMIN or COACH");
  }

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });
  if (authError) throw new Error(authError.message);

  await admin.from("profiles").update({ role, first_name: firstName, last_name: lastName }).eq("id", authUser.user.id);

  const perms = permissionsFromForm(authUser.user.id, formData);

  const { error: permError } = await admin.from("admin_permissions").upsert(perms);
  if (permError) throw new Error(permError.message);

  if (role === "COACH") {
    await admin.from("coaches").insert({ profile_id: authUser.user.id, is_active: true });
  }

  await logAudit({
    userId: (await requireSuperAdminProfile()).id,
    action: "CREATE",
    entityType: "staff_account",
    entityId: authUser.user.id,
    newValue: { email, role },
  });

  revalidatePath("/admin/staff");
}

export async function updateStaffPermissions(profileId: string, formData: FormData) {
  await requireSuperAdminProfile();
  const admin = createAdminClient();
  if (!admin) throw new Error("Database not configured");

  const perms = permissionsFromForm(profileId, formData);

  const { error } = await admin.from("admin_permissions").upsert(perms);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/staff");
}

export async function deactivateStaffAccount(profileId: string) {
  await requireSuperAdminProfile();
  const admin = createAdminClient();
  if (!admin) throw new Error("Database not configured");

  await admin.from("profiles").update({ is_active: false }).eq("id", profileId);
  await admin.from("admin_permissions").update({ is_active: false }).eq("profile_id", profileId);
  revalidatePath("/admin/staff");
}

export async function createStudentAccount(formData: FormData) {
  await requirePermission("create_edit_students");
  const admin = createAdminClient();
  if (!admin) throw new Error("Database not configured");

  const email = String(formData.get("login_email") || "").trim();
  const password = String(formData.get("login_password") || "");
  let profileId: string | null = null;

  if (email && password) {
    const { data: authUser, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    profileId = authUser.user.id;
    await admin.from("profiles").update({ role: "STUDENT", email }).eq("id", profileId);
  }

  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      profile_id: profileId,
      first_name: String(formData.get("first_name")),
      last_name: String(formData.get("last_name")),
      email: String(formData.get("email") || email || "") || null,
      phone: String(formData.get("phone") || "") || null,
      birthday: String(formData.get("birthday") || "") || null,
      status: "ACTIVE",
      notes: String(formData.get("notes") || "") || null,
    })
    .select("id")
    .single();
  if (studentError) throw new Error(studentError.message);

  const programId = String(formData.get("program_id") || "");
  const membershipType = String(formData.get("membership_type") || "MONTHLY");
  if (programId) {
    await admin.from("memberships").insert({
      student_id: student.id,
      program_id: programId,
      type: membershipType,
      status: "ACTIVE",
      start_date: new Date().toISOString().slice(0, 10),
    });
  }

  revalidatePath("/admin/students");
  return { id: student.id };
}

export async function createParentAccount(formData: FormData) {
  await requirePermission("create_edit_students");
  const admin = createAdminClient();
  if (!admin) throw new Error("Database not configured");

  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));
  const studentId = String(formData.get("student_id"));

  const { data: authUser, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: String(formData.get("first_name")),
      last_name: String(formData.get("last_name")),
    },
  });
  if (error) throw new Error(error.message);

  await admin
    .from("profiles")
    .update({
      role: "PARENT",
      first_name: String(formData.get("first_name")),
      last_name: String(formData.get("last_name")),
      email,
    })
    .eq("id", authUser.user.id);

  if (studentId) {
    await admin.from("parent_students").insert({
      parent_id: authUser.user.id,
      student_id: studentId,
    });
  }

  revalidatePath("/admin/students");
  return { id: authUser.user.id };
}
