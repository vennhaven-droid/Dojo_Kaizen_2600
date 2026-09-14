export type ChatRoomVisibility = "OPEN" | "INVITE" | "STAFF" | "PARENTS_STAFF";
export type ChatMemberStatus = "active" | "muted" | "removed" | "blocked";

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
