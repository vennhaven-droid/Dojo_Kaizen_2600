import { getCurrentProfile } from "@/lib/supabase/server";
import { getStaffPermissions } from "@/lib/permissions-server";
import { hasPermission } from "@/lib/permissions";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import type { UserRole } from "@/lib/types";

export default async function AdminChatPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const role = profile.role as UserRole;
  const perms = role === "SUPER_ADMIN" ? null : await getStaffPermissions(profile.id);
  const canManage = hasPermission(perms, role, "manage_chat");

  return (
    <div className="-m-4 h-[calc(100dvh-4rem)] sm:-m-6">
      <ChatWorkspace profileId={profile.id} canManage={canManage} />
    </div>
  );
}
