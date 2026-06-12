import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import { PortalShell } from "@/components/portals/portal-shell";
import type { UserRole } from "@/lib/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || !["SUPER_ADMIN", "ADMIN"].includes(profile.role)) {
    redirect("/login?redirect=/admin");
  }

  return (
    <PortalShell
      role={profile.role as UserRole}
      title="Admin Portal"
      userEmail={profile.email ?? undefined}
    >
      {children}
    </PortalShell>
  );
}
