import type { UserRole } from "@/lib/types";

export type PermissionFlag =
  | "view_students"
  | "create_edit_students"
  | "view_payments"
  | "create_edit_payments"
  | "view_inquiries"
  | "manage_inquiries"
  | "manage_enrollments"
  | "manage_media"
  | "manage_content"
  | "manage_programs"
  | "manage_coaches"
  | "manage_pricing"
  | "manage_schedule"
  | "manage_staff";

export type AdminPermissions = {
  profile_id: string;
  view_students: boolean;
  create_edit_students: boolean;
  view_payments: boolean;
  create_edit_payments: boolean;
  view_inquiries: boolean;
  manage_inquiries: boolean;
  manage_enrollments: boolean;
  manage_media: boolean;
  manage_content: boolean;
  manage_programs: boolean;
  manage_coaches: boolean;
  manage_pricing: boolean;
  manage_schedule: boolean;
  manage_staff: boolean;
  full_admin_access: boolean;
  is_active: boolean;
};

export const PERMISSION_LABELS: Record<PermissionFlag, string> = {
  view_students: "View student records",
  create_edit_students: "Create / edit student records",
  view_payments: "View payment records",
  create_edit_payments: "Create / edit payment records",
  view_inquiries: "View inquiries",
  manage_inquiries: "Manage inquiries",
  manage_enrollments: "Manage enrollment applications",
  manage_media: "Manage media / photos only",
  manage_content: "Manage website text / content",
  manage_programs: "Manage programs",
  manage_coaches: "Manage coaches",
  manage_pricing: "Manage pricing",
  manage_schedule: "Manage schedule",
  manage_staff: "Full admin access (staff management)",
};

export const ALL_PERMISSION_FLAGS: PermissionFlag[] = Object.keys(
  PERMISSION_LABELS
) as PermissionFlag[];

export function emptyPermissions(profileId: string): AdminPermissions {
  return {
    profile_id: profileId,
    view_students: false,
    create_edit_students: false,
    view_payments: false,
    create_edit_payments: false,
    view_inquiries: false,
    manage_inquiries: false,
    manage_enrollments: false,
    manage_media: false,
    manage_content: false,
    manage_programs: false,
    manage_coaches: false,
    manage_pricing: false,
    manage_schedule: false,
    manage_staff: false,
    full_admin_access: false,
    is_active: true,
  };
}

export function setPermission(perms: AdminPermissions, flag: PermissionFlag, value: boolean): void {
  perms[flag] = value;
}

export function permissionsFromForm(profileId: string, formData: FormData): AdminPermissions {
  const perms = emptyPermissions(profileId);
  ALL_PERMISSION_FLAGS.forEach((flag) => {
    if (formData.get(`perm_${flag}`) === "on") {
      setPermission(perms, flag, true);
    }
  });
  if (formData.get("perm_full_admin_access") === "on") {
    perms.full_admin_access = true;
    ALL_PERMISSION_FLAGS.forEach((flag) => setPermission(perms, flag, true));
  }
  return perms;
}

export function fullPermissions(profileId: string): AdminPermissions {
  const p = emptyPermissions(profileId);
  ALL_PERMISSION_FLAGS.forEach((flag) => setPermission(p, flag, true));
  p.full_admin_access = true;
  return p;
}

export function hasPermission(
  perms: AdminPermissions | null,
  role: UserRole,
  flag: PermissionFlag
): boolean {
  if (role === "SUPER_ADMIN") return true;
  if (!perms || !perms.is_active) return false;
  if (perms.full_admin_access) return true;
  return Boolean(perms[flag]);
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "COACH";
}

/** Nav item permission requirements */
export const ADMIN_NAV_PERMISSIONS: Record<string, PermissionFlag | "super_admin" | null> = {
  "/admin": null,
  "/admin/students": "view_students",
  "/admin/programs": "manage_programs",
  "/admin/coaches": "manage_coaches",
  "/admin/staff": "super_admin",
  "/admin/enrollments": "manage_enrollments",
  "/admin/inquiries": "view_inquiries",
  "/admin/payments": "view_payments",
  "/admin/lockers": "view_students",
  "/admin/attendance": "view_students",
  "/admin/competitions": "view_students",
  "/admin/retention": "view_students",
  "/admin/reports": "view_payments",
  "/admin/cms": "manage_content",
  "/admin/audit": "super_admin",
};

export function canSeeNavItem(
  href: string,
  role: UserRole,
  perms: AdminPermissions | null
): boolean {
  if (role === "SUPER_ADMIN") return true;
  const req = ADMIN_NAV_PERMISSIONS[href];
  if (req === "super_admin") return false;
  if (req === null) return true;
  return hasPermission(perms, role, req);
}
