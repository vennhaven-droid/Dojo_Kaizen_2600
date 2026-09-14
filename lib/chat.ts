import type { ChatMemberStatus, ChatRoomVisibility } from "@/lib/types";

export const CHAT_VISIBILITY_LABELS: Record<ChatRoomVisibility, string> = {
  OPEN: "All members",
  INVITE: "Invite only",
  STAFF: "Staff only",
  PARENTS_STAFF: "Parents and staff",
};

export const MUTE_DURATIONS = [
  { label: "1 hour", hours: 1 },
  { label: "8 hours", hours: 8 },
  { label: "24 hours", hours: 24 },
  { label: "7 days", hours: 24 * 7 },
  { label: "Until unmuted", hours: null },
] as const;

export function muteUntilIso(hours: number | null): string | null {
  if (hours == null) return null;
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function displayName(profile: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
} | null | undefined): string {
  const name = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
  return name || profile?.email || "Member";
}

export function isEffectivelyMuted(
  status: ChatMemberStatus,
  mutedUntil: string | null | undefined
): boolean {
  if (status !== "muted") return false;
  if (!mutedUntil) return true;
  return new Date(mutedUntil).getTime() > Date.now();
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
