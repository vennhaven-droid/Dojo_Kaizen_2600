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
