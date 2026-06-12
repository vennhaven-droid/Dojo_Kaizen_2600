import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import { PortalShell } from "@/components/portals/portal-shell";
import type { UserRole } from "@/lib/types";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "STUDENT") {
    redirect("/login?redirect=/student");
  }
  return (
    <PortalShell role={profile.role as UserRole} title="Student Portal" userEmail={profile.email ?? undefined}>
      {children}
    </PortalShell>
  );
}
