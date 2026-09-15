"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CHAT_VISIBILITY_LABELS,
  MUTE_DURATIONS,
  displayName,
  initials,
  isEffectivelyMuted,
  muteUntilIso,
} from "@/lib/chat";
import { cn } from "@/lib/utils";
import type {
  ChatMember,
  ChatMessage,
  ChatRoom,
  ChatRoomVisibility,
  UserRole,
} from "@/lib/types";

type ProfileLite = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
};

type MemberRow = ChatMember & { profiles: ProfileLite | null };
type MessageRow = ChatMessage & { profiles: ProfileLite | null };

function rpcError(error: { message?: string } | null): string {
  return error?.message ?? "Something went wrong";
}

export function ChatWorkspace({
  profileId,
  canManage,
}: {
  profileId: string;
  canManage: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [myMember, setMyMember] = useState<MemberRow | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [mobileThread, setMobileThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;
  const muted = myMember
    ? isEffectivelyMuted(myMember.status, myMember.muted_until)
    : false;

  const loadRooms = useCallback(async () => {
    await supabase.rpc("sync_my_chat_memberships");
    const { data, error: roomsError } = await supabase
      .from("chat_rooms")
      .select("*")
      .order("name");
    if (roomsError) {
      setError(roomsError.message);
      return;
    }
    const list = (data ?? []) as ChatRoom[];
    setRooms(list);
    setActiveRoomId((current) => {
      if (current && list.some((r) => r.id === current)) return current;
      return list[0]?.id ?? null;
    });
  }, [supabase]);

  const loadThread = useCallback(
    async (roomId: string) => {
      const [{ data: messageData }, { data: memberData }] = await Promise.all([
        supabase
          .from("chat_messages")
          .select("*, profiles!sender_id(id, first_name, last_name, email, role, avatar_url)")
          .eq("room_id", roomId)
          .order("created_at", { ascending: true })
          .limit(200),
        supabase
          .from("chat_members")
          .select("*, profiles!profile_id(id, first_name, last_name, email, role, avatar_url)")
          .eq("room_id", roomId)
          .order("created_at"),
      ]);
      const nextMembers = (memberData ?? []) as MemberRow[];
      setMessages((messageData ?? []) as MessageRow[]);
      setMembers(nextMembers);
      setMyMember(nextMembers.find((m) => m.profile_id === profileId) ?? null);
    },
    [profileId, supabase]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadRooms();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadRooms]);

  useEffect(() => {
    if (!activeRoomId) return;
    void loadThread(activeRoomId);
  }, [activeRoomId, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeRoomId]);

  useEffect(() => {
    const channel = supabase
      .channel("dojo-chat")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages" },
        (payload) => {
          const row = (payload.new ?? payload.old) as ChatMessage | undefined;
          if (!row?.room_id) return;
          if (row.room_id === activeRoomId) {
            void loadThread(row.room_id);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_members" },
        (payload) => {
          const row = (payload.new ?? payload.old) as ChatMember | undefined;
          if (row?.profile_id === profileId) {
            void loadRooms();
          }
          if (row?.room_id === activeRoomId) {
            void loadThread(row.room_id);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_rooms" },
        () => {
          void loadRooms();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeRoomId, loadRooms, loadThread, profileId, supabase]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!activeRoomId || muted || sending) return;
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setError("");
    const { error: insertError } = await supabase.from("chat_messages").insert({
      room_id: activeRoomId,
      sender_id: profileId,
      body,
      kind: "text",
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      setDraft("");
    }
    setSending(false);
  }

  async function runRpc(fn: string, args: Record<string, unknown>) {
    setError("");
    const { error: callError } = await supabase.rpc(fn, args);
    if (callError) setError(rpcError(callError));
    if (activeRoomId) await loadThread(activeRoomId);
    await loadRooms();
  }

  return (
    <div className="flex h-full min-h-[28rem] overflow-hidden rounded-none border-0 bg-kaizen-dark md:rounded-none">
      <aside
        className={cn(
          "w-full shrink-0 border-r border-blue/20 md:w-72",
          mobileThread ? "hidden md:flex md:flex-col" : "flex flex-col"
        )}
      >
        <div className="flex items-center justify-between border-b border-blue/20 px-4 py-3">
          <h2 className="font-display text-lg font-bold">Chats</h2>
          {canManage && (
            <Button size="sm" variant="gold" onClick={() => setShowCreate((v) => !v)}>
              New
            </Button>
          )}
        </div>
        {canManage && showCreate && (
          <CreateRoomForm
            onCreated={async (roomId) => {
              setShowCreate(false);
              await loadRooms();
              setActiveRoomId(roomId);
              setMobileThread(true);
            }}
            onCancel={() => setShowCreate(false)}
            onError={setError}
          />
        )}
        <div className="flex-1 overflow-y-auto p-2">
          {loading && <p className="px-2 py-4 text-sm text-kaizen-muted">Loading rooms…</p>}
          {!loading && rooms.length === 0 && (
            <p className="px-2 py-4 text-sm text-kaizen-muted">No chat rooms yet.</p>
          )}
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => {
                setActiveRoomId(room.id);
                setMobileThread(true);
                setShowMembers(false);
              }}
              className={cn(
                "mb-1 w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                room.id === activeRoomId ? "bg-blue/20 text-kaizen-gray" : "hover:bg-blue/10 text-kaizen-muted"
              )}
            >
              <p className="truncate font-semibold text-kaizen-gray">{room.name}</p>
              <p className="truncate text-xs">
                {CHAT_VISIBILITY_LABELS[room.visibility]}
                {room.is_archived ? " · Archived" : ""}
              </p>
            </button>
          ))}
        </div>
      </aside>

      <section
        className={cn(
          "min-w-0 flex-1 flex-col",
          mobileThread ? "flex" : "hidden md:flex"
        )}
      >
        {activeRoom ? (
          <>
            <header className="flex items-center gap-2 border-b border-blue/20 px-3 py-3 sm:px-4">
              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm text-kaizen-muted hover:bg-blue/10 md:hidden"
                onClick={() => setMobileThread(false)}
              >
                Back
              </button>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-lg font-bold">{activeRoom.name}</h3>
                <p className="truncate text-xs text-kaizen-muted">
                  {activeRoom.description || CHAT_VISIBILITY_LABELS[activeRoom.visibility]}
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setShowMembers((v) => !v)}>
                Members
              </Button>
            </header>

            <div className="flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4">
                  {messages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      message={message}
                      mine={message.sender_id === profileId}
                      canManage={canManage}
                      onDelete={() => runRpc("delete_chat_message", { p_message_id: message.id })}
                    />
                  ))}
                  <div ref={bottomRef} />
                </div>
                {error && <p className="px-4 pb-2 text-sm text-red-400">{error}</p>}
                {muted && (
                  <p className="px-4 pb-2 text-sm text-gold">
                    You are muted in this chat
                    {myMember?.muted_until
                      ? ` until ${new Date(myMember.muted_until).toLocaleString()}`
                      : "."}
                  </p>
                )}
                {activeRoom.is_archived && (
                  <p className="px-4 pb-2 text-sm text-kaizen-muted">This room is archived. Messaging is turned off.</p>
                )}
                <form onSubmit={sendMessage} className="flex gap-2 border-t border-blue/20 p-3">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={muted ? "You are muted" : "Message"}
                    maxLength={2000}
                    disabled={muted || sending || activeRoom.is_archived}
                  />
                  <Button type="submit" variant="gold" disabled={muted || sending || !draft.trim()}>
                    Send
                  </Button>
                </form>
              </div>
              {showMembers && (
                <MembersPanel
                  room={activeRoom}
                  members={members}
                  canManage={canManage}
                  onClose={() => setShowMembers(false)}
                  onAction={runRpc}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-kaizen-muted">
            Select a chat to get started.
          </div>
        )}
      </section>
    </div>
  );
}

function ChatBubble({
  message,
  mine,
  canManage,
  onDelete,
}: {
  message: MessageRow;
  mine: boolean;
  canManage: boolean;
  onDelete: () => void;
}) {
  if (message.kind === "system") {
    return (
      <p className="text-center text-xs text-kaizen-muted">{message.body}</p>
    );
  }

  const name = displayName(message.profiles);
  const deleted = Boolean(message.deleted_at);

  return (
    <div className={cn("flex gap-2", mine ? "justify-end" : "justify-start")}>
      {!mine && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue/20 text-xs font-bold text-blue">
          {initials(name)}
        </div>
      )}
      <div className={cn("max-w-[80%] rounded-2xl px-3 py-2", mine ? "bg-blue text-white" : "bg-kaizen-black text-kaizen-gray")}>
        {!mine && <p className="mb-0.5 text-[11px] font-semibold text-gold">{name}</p>}
        <p className={cn("whitespace-pre-wrap text-sm", deleted && "italic text-kaizen-muted")}>
          {deleted ? "This message was deleted" : message.body}
        </p>
        <p className="mt-1 text-[10px] opacity-70">
          {new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </p>
        {!deleted && (mine || canManage) && (
          <button type="button" className="mt-1 text-[10px] underline opacity-80" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function CreateRoomForm({
  onCreated,
  onCancel,
  onError,
}: {
  onCreated: (roomId: string) => Promise<void>;
  onCancel: () => void;
  onError: (message: string) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    const { data, error } = await supabase.rpc("create_chat_room", {
      p_name: String(form.get("name") ?? "").trim(),
      p_description: String(form.get("description") ?? "").trim() || null,
      p_visibility: String(form.get("visibility") ?? "INVITE"),
    });
    setPending(false);
    if (error) {
      onError(error.message);
      return;
    }
    const room = (Array.isArray(data) ? data[0] : data) as ChatRoom | null;
    if (room?.id) await onCreated(room.id);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border-b border-blue/20 p-3">
      <Input name="name" placeholder="Room name" required maxLength={80} />
      <Input name="description" placeholder="Description (optional)" maxLength={160} />
      <select
        name="visibility"
        className="w-full rounded-md border border-blue/30 bg-kaizen-black px-3 py-2 text-sm"
        defaultValue="INVITE"
      >
        {(Object.keys(CHAT_VISIBILITY_LABELS) as ChatRoomVisibility[]).map((key) => (
          <option key={key} value={key}>
            {CHAT_VISIBILITY_LABELS[key]}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1" disabled={pending}>
          {pending ? "Creating…" : "Create room"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function MembersPanel({
  room,
  members,
  canManage,
  onClose,
  onAction,
}: {
  room: ChatRoom;
  members: MemberRow[];
  canManage: boolean;
  onClose: () => void;
  onAction: (fn: string, args: Record<string, unknown>) => Promise<void>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<ProfileLite[]>([]);

  useEffect(() => {
    if (!canManage) return;
    void supabase
      .from("profiles")
      .select("id, first_name, last_name, email, role, avatar_url")
      .eq("is_active", true)
      .order("first_name")
      .then(({ data }) => setPeople((data ?? []) as ProfileLite[]));
  }, [canManage, supabase]);

  const visibleMembers = canManage
    ? members
    : members.filter((m) => m.status === "active" || m.status === "muted");

  const memberIds = new Set(members.map((m) => m.profile_id));
  const suggestions = people
    .filter((p) => !memberIds.has(p.id) || members.find((m) => m.profile_id === p.id)?.status === "removed")
    .filter((p) => {
      const hay = `${p.first_name ?? ""} ${p.last_name ?? ""} ${p.email ?? ""}`.toLowerCase();
      return hay.includes(query.toLowerCase());
    })
    .slice(0, 8);

  return (
    <aside className="flex w-full max-w-full shrink-0 flex-col border-l border-blue/20 bg-kaizen-black md:w-80">
      <div className="flex items-center justify-between border-b border-blue/20 px-3 py-3">
        <h4 className="font-display text-sm font-bold">Members</h4>
        <button type="button" className="text-sm text-kaizen-muted" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {canManage && (
          <div className="space-y-2 rounded-lg border border-blue/20 p-3">
            <Label>Add member</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email"
            />
            {query &&
              suggestions.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-blue/10"
                  onClick={() => onAction("add_chat_member", { p_room_id: room.id, p_profile_id: person.id })}
                >
                  {displayName(person)}{" "}
                  <span className="text-xs text-kaizen-muted">{person.role}</span>
                </button>
              ))}
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={() => onAction("archive_chat_room", { p_room_id: room.id, p_archived: !room.is_archived })}
            >
              {room.is_archived ? "Unarchive room" : "Archive room"}
            </Button>
          </div>
        )}
        {visibleMembers.map((member) => {
          const name = displayName(member.profiles);
          const muted = isEffectivelyMuted(member.status, member.muted_until);
          return (
            <div key={member.id} className="rounded-lg border border-blue/10 p-3">
              <p className="font-medium">{name}</p>
              <p className="text-xs uppercase text-kaizen-muted">
                {member.profiles?.role} · {member.status}
                {muted && member.muted_until ? ` until ${new Date(member.muted_until).toLocaleString()}` : ""}
              </p>
              {canManage && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(member.status === "active" || muted) &&
                    MUTE_DURATIONS.map((option) => (
                      <Button
                        key={option.label}
                        size="sm"
                        variant="secondary"
                        className="h-7 px-2 text-[11px]"
                        onClick={() =>
                          onAction("mute_chat_member", {
                            p_room_id: room.id,
                            p_profile_id: member.profile_id,
                            p_muted_until: muteUntilIso(option.hours),
                          })
                        }
                      >
                        Mute {option.label}
                      </Button>
                    ))}
                  {muted && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 px-2 text-[11px]"
                      onClick={() =>
                        onAction("unmute_chat_member", {
                          p_room_id: room.id,
                          p_profile_id: member.profile_id,
                        })
                      }
                    >
                      Unmute
                    </Button>
                  )}
                  {(member.status === "active" || muted) && (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-[11px]"
                        onClick={() =>
                          onAction("kick_chat_member", {
                            p_room_id: room.id,
                            p_profile_id: member.profile_id,
                          })
                        }
                      >
                        Remove
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-[11px]"
                        onClick={() =>
                          onAction("block_chat_member", {
                            p_room_id: room.id,
                            p_profile_id: member.profile_id,
                          })
                        }
                      >
                        Block
                      </Button>
                    </>
                  )}
                  {member.status === "removed" && (
                    <Button
                      size="sm"
                      variant="gold"
                      className="h-7 px-2 text-[11px]"
                      onClick={() =>
                        onAction("add_chat_member", {
                          p_room_id: room.id,
                          p_profile_id: member.profile_id,
                        })
                      }
                    >
                      Add back
                    </Button>
                  )}
                  {member.status === "blocked" && (
                    <Button
                      size="sm"
                      variant="gold"
                      className="h-7 px-2 text-[11px]"
                      onClick={() =>
                        onAction("unblock_chat_member", {
                          p_room_id: room.id,
                          p_profile_id: member.profile_id,
                        })
                      }
                    >
                      Unblock
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
