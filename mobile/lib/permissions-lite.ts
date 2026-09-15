type StaffRole = "SUPER_ADMIN" | "ADMIN" | "COACH";

const ADMIN_NAV_PERMISSIONS: Record<string, string | null> = {
  "/admin": null,
  "/admin/students": "view_students",
  "/admin/programs": "manage_programs",
  "/admin/coaches": "manage_coaches",
  "/admin/pricing": "manage_pricing",
  "/admin/users": "manage_staff",
  "/admin/enrollments": "manage_enrollments",
  "/admin/inquiries": "view_inquiries",
  "/admin/payments": "view_payments",
  "/admin/lockers": "view_students",
  "/admin/attendance": "view_students",
  "/admin/competitions": "view_students",
};

export function canSeeNavItem(href: string, role: string, raw: Record<string, boolean> | null): boolean {
  if (role === "SUPER_ADMIN") return true;
  if (role !== "ADMIN" && role !== "COACH") return false;
  const req = ADMIN_NAV_PERMISSIONS[href];
  if (req === undefined) return false;
  if (req === null) return true;
  if (raw?.is_active === false) return false;
  if (raw?.full_admin_access) return true;
  return Boolean(raw?.[req]);
}

export function isStaffRole(role: string | undefined): role is StaffRole {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "COACH";
}
