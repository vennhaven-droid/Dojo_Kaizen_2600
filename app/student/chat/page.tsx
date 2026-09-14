import { getCurrentProfile } from "@/lib/supabase/server";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default async function StudentChatPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  return (
    <div className="-m-4 h-[calc(100dvh-4rem)] sm:-m-6">
      <ChatWorkspace profileId={profile.id} canManage={false} />
    </div>
  );
}
