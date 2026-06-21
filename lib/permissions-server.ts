import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import type { AdminPermissions, PermissionFlag } from "@/lib/permissions";
import { canAccessAdmin, hasPermission } from "@/lib/permissions";
import type { UserRole } from "@/lib/types";

export async function getStaffPermissions(profileId: string): Promise<AdminPermissions | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("admin_permissions")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  return data as AdminPermissions | null;
}

export async function requireStaffProfile() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Unauthorized");
  if (!canAccessAdmin(profile.role as UserRole)) throw new Error("Forbidden");
  if (profile.is_active === false) throw new Error("Account deactivated");
  return profile;
}

export async function requirePermission(flag: PermissionFlag) {
  const profile = await requireStaffProfile();
  const role = profile.role as UserRole;
  if (role === "SUPER_ADMIN") return profile;
  const perms = await getStaffPermissions(profile.id);
  if (!hasPermission(perms, role, flag)) throw new Error("Forbidden");
  return profile;
}

export async function requireSuperAdminProfile() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  if (profile.is_active === false) throw new Error("Account deactivated");
  return profile;
}
