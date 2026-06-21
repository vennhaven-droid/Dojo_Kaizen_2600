import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import { getStaffPermissions } from "@/lib/permissions-server";
import { PortalShell } from "@/components/portals/portal-shell";
import { canAccessAdmin } from "@/lib/permissions";
import type { UserRole } from "@/lib/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const role = profile?.role as UserRole | undefined;

  if (!profile || !role || !canAccessAdmin(role)) {
    redirect("/login?redirect=/admin&portal=staff");
  }

  if (profile.is_active === false) {
    redirect("/login?error=deactivated");
  }

  const permissions =
    role === "SUPER_ADMIN" ? null : await getStaffPermissions(profile.id);

  return (
    <PortalShell
      role={role}
      title="Admin Portal"
      userEmail={profile.email ?? undefined}
      permissions={permissions}
    >
      {children}
    </PortalShell>
  );
}
