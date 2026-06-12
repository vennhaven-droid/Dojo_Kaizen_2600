import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import { PortalShell } from "@/components/portals/portal-shell";
import type { UserRole } from "@/lib/types";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "PARENT") {
    redirect("/login?redirect=/parent");
  }
  return (
    <PortalShell role={profile.role as UserRole} title="Parent Portal" userEmail={profile.email ?? undefined}>
      {children}
    </PortalShell>
  );
}
