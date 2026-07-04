import {
  getRouteForRole,
  roleMatchesPortal,
  type LoginPortal,
} from "@/lib/auth-routes";

export type LoginRedirectResult =
  | { ok: true; path: string }
  | { ok: false; error: "no_account" | "deactivated" | "wrong_portal_member" | "wrong_portal_staff" };

export function resolveLoginRedirect(
  profile: { role: string; is_active: boolean | null } | null,
  portal: LoginPortal,
  redirectPath?: string | null
): LoginRedirectResult {
  if (!profile) {
    return { ok: false, error: "no_account" };
  }

  if (profile.is_active === false) {
    return { ok: false, error: "deactivated" };
  }

  const role = profile.role;
  if (!roleMatchesPortal(role, portal)) {
    return {
      ok: false,
      error: portal === "member" ? "wrong_portal_member" : "wrong_portal_staff",
    };
  }

  const path =
    redirectPath && redirectPath.startsWith("/") ? redirectPath : getRouteForRole(role);

  return { ok: true, path };
}
