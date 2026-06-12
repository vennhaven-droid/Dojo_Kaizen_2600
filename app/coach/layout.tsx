import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import { PortalShell } from "@/components/portals/portal-shell";
import type { UserRole } from "@/lib/types";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || !["COACH", "SUPER_ADMIN", "ADMIN"].includes(profile.role)) {
    redirect("/login?redirect=/coach");
  }
  return (
    <PortalShell role="COACH" title="Coach Portal" userEmail={profile.email ?? undefined}>
      {children}
    </PortalShell>
  );
}
