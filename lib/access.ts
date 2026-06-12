import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function requireProfile(allowedRoles?: UserRole[]) {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("Unauthorized");
  }
  if (allowedRoles && !allowedRoles.includes(profile.role as UserRole)) {
    throw new Error("Forbidden");
  }
  return profile;
}

export async function requireAdmin() {
  return requireProfile(["SUPER_ADMIN", "ADMIN"]);
}

export async function requireSuperAdmin() {
  return requireProfile(["SUPER_ADMIN"]);
}

export function isAdminRole(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export async function getParentStudentIds(parentId: string): Promise<string[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("parent_students")
    .select("student_id")
    .eq("parent_id", parentId);
  return (data ?? []).map((r) => r.student_id);
}

export async function getStudentForUser(userId: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("students")
    .select("*")
    .eq("profile_id", userId)
    .single();
  return data;
}
