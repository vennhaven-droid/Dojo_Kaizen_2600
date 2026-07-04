export type LoginPortal = "member" | "staff";

export function parseLoginPortal(value: string | null | undefined): LoginPortal {
  return value === "staff" ? "staff" : "member";
}

export function roleMatchesPortal(
  role: string | undefined,
  portal: LoginPortal
): boolean {
  if (!role) return false;
  if (portal === "member") return role === "STUDENT" || role === "PARENT";
  return role === "COACH" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  auth_callback: "Sign-in failed. Please try again.",
  no_account: "No account found for that Google email. Contact the dojo to get access.",
  deactivated: "This account has been deactivated. Contact the dojo.",
  wrong_portal_member:
    "This account is not a student or parent login. Try Coach / Admin.",
  wrong_portal_staff: "This account is not staff. Try Student / Parent login.",
};

export function getRouteForRole(role: string | undefined): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
    case "COACH":
      return "/admin";
    case "PARENT":
      return "/parent";
    case "STUDENT":
      return "/student";
    default:
      return "/";
  }
}

export function isStaffRole(role: string | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "COACH";
}
