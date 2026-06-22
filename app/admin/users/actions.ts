"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdminProfile } from "@/lib/permissions-server";
import { ALL_PERMISSION_FLAGS, permissionsFromForm } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { createStudent } from "../students/actions";

export async function createUserAccount(formData: FormData) {
  await requireSuperAdminProfile();
  const accountType = String(formData.get("account_type"));

  if (accountType === "STUDENT") {
    const result = await createStudent(formData);
    revalidatePath("/admin/users");
    revalidatePath("/admin/students");
    redirect(`/admin/students/${result.id}`);
  }

  if (accountType === "PARENT") {
    await createParentUser(formData);
    revalidatePath("/admin/users");
    return;
  }

  if (accountType === "COACH" || accountType === "ADMIN") {
    await createStaffUser(formData, accountType as "COACH" | "ADMIN");
    revalidatePath("/admin/users");
    return;
  }

  throw new Error("Invalid account type");
}

async function createStaffUser(formData: FormData, role: "COACH" | "ADMIN") {
  const admin = createAdminClient();
  if (!admin) throw new Error("Database not configured");

  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));
  const firstName = String(formData.get("first_name")).trim();
  const lastName = String(formData.get("last_name")).trim();

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });
  if (authError) throw new Error(authError.message);

  await admin
    .from("profiles")
    .update({ role, first_name: firstName, last_name: lastName, email, is_active: true })
    .eq("id", authUser.user.id);

  const perms = permissionsFromForm(authUser.user.id, formData);
  const { error: permError } = await admin.from("admin_permissions").upsert(perms);
  if (permError) throw new Error(permError.message);

  if (role === "COACH") {
    await admin.from("coaches").upsert({
      profile_id: authUser.user.id,
      is_active: true,
      bio: String(formData.get("bio") || "") || null,
    });
  }

  const actor = await requireSuperAdminProfile();
  await logAudit({
    userId: actor.id,
    action: "CREATE",
    entityType: "user_account",
    entityId: authUser.user.id,
    newValue: { email, role },
  });
}

async function createParentUser(formData: FormData) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Database not configured");

  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));
  const studentId = String(formData.get("student_id") || "");

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
      is_active: true,
    })
    .eq("id", authUser.user.id);

  if (studentId) {
    await admin.from("parent_students").insert({
      parent_id: authUser.user.id,
      student_id: studentId,
    });
  }
}

export async function updateStaffPermissions(profileId: string, formData: FormData) {
  await requireSuperAdminProfile();
  const admin = createAdminClient();
  if (!admin) throw new Error("Database not configured");

  const perms = permissionsFromForm(profileId, formData);
  const { error } = await admin.from("admin_permissions").upsert(perms);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function deactivateUserAccount(profileId: string) {
  await requireSuperAdminProfile();
  const admin = createAdminClient();
  if (!admin) throw new Error("Database not configured");

  await admin.from("profiles").update({ is_active: false }).eq("id", profileId);
  await admin.from("admin_permissions").update({ is_active: false }).eq("profile_id", profileId);
  revalidatePath("/admin/users");
}
