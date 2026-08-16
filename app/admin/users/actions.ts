"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  requireSuperAdminProfile,
  requireStaffManagement,
  requirePermission,
} from "@/lib/permissions-server";
import { permissionsFromForm, type AdminPermissions } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { createStudent } from "../students/actions";

export type UserFormState = { error?: string; success?: string } | null;

function sanitizeStaffPermissions(perms: AdminPermissions, isSuperAdmin: boolean): AdminPermissions {
  if (isSuperAdmin) return perms;
  perms.manage_staff = false;
  perms.full_admin_access = false;
  return perms;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}

function isAlreadyRegistered(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("already been registered") ||
    lower.includes("already registered") ||
    lower.includes("user already exists") ||
    lower.includes("duplicate")
  );
}

export async function createUserAccount(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  try {
    const accountType = String(formData.get("account_type"));

    if (accountType === "STUDENT") {
      const result = await createStudent(formData);
      revalidatePath("/admin/users");
      revalidatePath("/admin/students");
      redirect(`/admin/students/${result.id}`);
    }

    if (accountType === "PARENT") {
      await requirePermission("create_edit_students");
      await createParentUser(formData);
      revalidatePath("/admin/users");
      return { success: "Parent account created." };
    }

    if (accountType === "COACH" || accountType === "ADMIN") {
      await requireStaffManagement();
      const reused = await createStaffUser(formData, accountType as "COACH" | "ADMIN");
      revalidatePath("/admin/users");
      return {
        success: reused
          ? `${accountType === "ADMIN" ? "Admin" : "Coach"} access granted to the existing account.`
          : `${accountType === "ADMIN" ? "Admin" : "Coach"} account created.`,
      };
    }

    return { error: "Invalid account type" };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: errorMessage(err) };
  }
}

async function findAuthUserByEmail(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  email: string
): Promise<User | null> {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(error.message);
  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function getOrCreateAuthUser(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
): Promise<{ user: User; reused: boolean }> {
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { first_name: input.firstName, last_name: input.lastName },
  });

  if (!authError && authUser.user) {
    return { user: authUser.user, reused: false };
  }

  if (authError && isAlreadyRegistered(authError.message)) {
    const existing = await findAuthUserByEmail(admin, input.email);
    if (!existing) {
      throw new Error("That email is already registered, but the account could not be loaded.");
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
      password: input.password,
      email_confirm: true,
      user_metadata: { first_name: input.firstName, last_name: input.lastName },
    });
    if (updateError) throw new Error(updateError.message);
    return { user: existing, reused: true };
  }

  throw new Error(authError?.message ?? "Could not create the login account.");
}

async function createStaffUser(formData: FormData, role: "COACH" | "ADMIN"): Promise<boolean> {
  const actor = await requireStaffManagement();
  const admin = createAdminClient();
  if (!admin) throw new Error("Database not configured");

  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));
  const firstName = String(formData.get("first_name")).trim();
  const lastName = String(formData.get("last_name")).trim();

  const { user, reused } = await getOrCreateAuthUser(admin, {
    email,
    password,
    firstName,
    lastName,
  });

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({
      id: user.id,
      role,
      first_name: firstName,
      last_name: lastName,
      email,
      is_active: true,
    });
  if (profileError) throw new Error(profileError.message);

  const isSuperAdmin = actor.role === "SUPER_ADMIN";
  const perms = sanitizeStaffPermissions(permissionsFromForm(user.id, formData), isSuperAdmin);
  const { error: permError } = await admin.from("admin_permissions").upsert(perms);
  if (permError) throw new Error(permError.message);

  if (role === "COACH") {
    await admin.from("coaches").upsert({
      profile_id: user.id,
      is_active: true,
      bio: String(formData.get("bio") || "") || null,
    });
  }

  await logAudit({
    userId: actor.id,
    action: reused ? "UPDATE" : "CREATE",
    entityType: "user_account",
    entityId: user.id,
    newValue: { email, role, reused },
  });

  return reused;
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
