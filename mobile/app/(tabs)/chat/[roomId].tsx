import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth";
import {
  MUTE_DURATIONS,
  displayName,
  isEffectivelyMuted,
  muteUntilIso,
  type ChatMemberStatus,
} from "@/lib/chat";
import { colors } from "@/constants/Colors";

type ProfileLite = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role?: string;
};

type Message = {
  id: string;
  room_id: string;
  sender_id: string | null;
  body: string;
  kind: "text" | "system";
  deleted_at: string | null;
  created_at: string;
  profiles: ProfileLite | null;
};

type Member = {
  id: string;
  profile_id: string;
  status: ChatMemberStatus;
  muted_until: string | null;
  profiles: ProfileLite | null;
};

type Room = {
  id: string;
  name: string;
  is_archived: boolean;
};

export default function ChatRoomScreen() {
  const { roomId, name } = useLocalSearchParams<{ roomId: string; name?: string }>();
  const navigation = useNavigation();
  const { me } = useAuth();
  const profileId = me?.profile.id;
  const canManage = Boolean(me?.canManageChat);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: room?.name || (typeof name === "string" && name) || "Chat",
      headerRight: () => (
        <Pressable onPress={() => setShowMembers(true)}>
          <Text style={{ color: colors.gold, fontWeight: "800" }}>Members</Text>
        </Pressable>
      ),
    });
  }, [name, navigation, room?.name]);

  const load = useCallback(async () => {
    if (!roomId) return;
    const [{ data: messageData }, { data: memberData }, { data: roomData }] = await Promise.all([
      supabase
        .from("chat_messages")
        .select("*, profiles!sender_id(id, first_name, last_name, email, role)")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(200),
      supabase
        .from("chat_members")
        .select("*, profiles!profile_id(id, first_name, last_name, email, role)")
        .eq("room_id", roomId),
      supabase.from("chat_rooms").select("id, name, is_archived").eq("id", roomId).maybeSingle(),
    ]);
    setMessages((messageData ?? []) as Message[]);
    setMembers((memberData ?? []) as Member[]);
    setRoom((roomData as Room | null) ?? null);
  }, [roomId]);

  useEffect(() => {
    void load();
    if (!roomId) return;
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        () => {
          void load();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_members", filter: `room_id=eq.${roomId}` },
        () => {
          void load();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load, roomId]);

  const mine = members.find((m) => m.profile_id === profileId);
  const muted = mine ? isEffectivelyMuted(mine.status, mine.muted_until) : false;
  const archived = Boolean(room?.is_archived);

  async function send() {
    const body = draft.trim();
    if (!body || !roomId || !profileId || muted || archived) return;
    setError("");
    const { error: insertError } = await supabase.from("chat_messages").insert({
      room_id: roomId,
      sender_id: profileId,
      body,
      kind: "text",
    });
    if (insertError) setError(insertError.message);
    else setDraft("");
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <Bubble
            message={item}
            mine={item.sender_id === profileId}
            canManage={canManage}
            onDeleted={load}
          />
        )}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {muted ? (
        <Text style={styles.mutedBanner}>
          You are muted{mine?.muted_until ? ` until ${new Date(mine.muted_until).toLocaleString()}` : "."}
        </Text>
      ) : null}
      {archived ? <Text style={styles.mutedBanner}>This room is archived. Messaging is turned off.</Text> : null}
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={archived ? "Room archived" : muted ? "You are muted" : "Message"}
          placeholderTextColor={colors.muted}
          editable={!muted && !archived}
          maxLength={2000}
        />
        <Pressable style={styles.send} onPress={send} disabled={muted || archived || !draft.trim()}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
      <MembersModal
        visible={showMembers}
        onClose={() => setShowMembers(false)}
        roomId={roomId ?? ""}
        isArchived={archived}
        members={members}
        canManage={canManage}
        onChanged={load}
      />
    </KeyboardAvoidingView>
  );
}

function Bubble({
  message,
  mine,
  canManage,
  onDeleted,
}: {
  message: Message;
  mine: boolean;
  canManage: boolean;
  onDeleted: () => Promise<void>;
}) {
  if (message.kind === "system") {
    return <Text style={styles.system}>{message.body}</Text>;
  }
  const deleted = Boolean(message.deleted_at);
  return (
    <View style={[styles.bubbleWrap, mine ? { alignItems: "flex-end" } : { alignItems: "flex-start" }]}>
      {!mine && <Text style={styles.sender}>{displayName(message.profiles)}</Text>}
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <Text style={[styles.body, deleted && { fontStyle: "italic", color: colors.muted }]}>
          {deleted ? "This message was deleted" : message.body}
        </Text>
      </View>
      {!deleted && (mine || canManage) && (
        <Pressable
          onPress={async () => {
            await supabase.rpc("delete_chat_message", { p_message_id: message.id });
            await onDeleted();
          }}
        >
          <Text style={styles.delete}>Delete</Text>
        </Pressable>
      )}
    </View>
  );
}

function MembersModal({
  visible,
  onClose,
  roomId,
  isArchived,
  members,
  canManage,
  onChanged,
}: {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  isArchived: boolean;
  members: Member[];
  canManage: boolean;
  onChanged: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<ProfileLite[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible || !canManage) return;
    void supabase
      .from("profiles")
      .select("id, first_name, last_name, email, role")
      .eq("is_active", true)
      .order("first_name")
      .then(({ data }) => setPeople((data ?? []) as ProfileLite[]));
  }, [canManage, visible]);

  async function run(fn: string, args: Record<string, unknown>) {
    setError("");
    const { error: rpcError } = await supabase.rpc(fn, args);
    if (rpcError) setError(rpcError.message);
    await onChanged();
  }

  const visibleMembers = canManage
    ? members
    : members.filter((m) => m.status === "active" || m.status === "muted");
  const ids = new Set(members.filter((m) => m.status !== "removed").map((m) => m.profile_id));
  const suggestions = people
    .filter((p) => !ids.has(p.id))
    .filter((p) => `${p.first_name ?? ""} ${p.last_name ?? ""} ${p.email ?? ""}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modal}>
        <Pressable onPress={onClose}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
        <Text style={styles.modalTitle}>Members</Text>
        {canManage && (
          <>
            <TextInput
              placeholder="Add member by name or email"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={query}
              onChangeText={setQuery}
            />
            {query
              ? suggestions.map((person) => (
                  <Pressable
                    key={person.id}
                    style={styles.member}
                    onPress={() => run("add_chat_member", { p_room_id: roomId, p_profile_id: person.id })}
                  >
                    <Text style={styles.body}>{displayName(person)}</Text>
                  </Pressable>
                ))
              : null}
            <Pressable
              style={styles.action}
              onPress={() => run("archive_chat_room", { p_room_id: roomId, p_archived: !isArchived })}
            >
              <Text style={styles.actionText}>{isArchived ? "Unarchive room" : "Archive room"}</Text>
            </Pressable>
          </>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <ScrollView>
          {visibleMembers.map((member) => {
            const muted = isEffectivelyMuted(member.status, member.muted_until);
            return (
              <View key={member.id} style={styles.member}>
                <Text style={styles.body}>{displayName(member.profiles)}</Text>
                <Text style={styles.caption}>
                  {member.profiles?.role} · {member.status}
                  {muted && member.muted_until ? ` until ${new Date(member.muted_until).toLocaleString()}` : ""}
                </Text>
                {canManage && (
                  <View style={styles.actions}>
                    {(member.status === "active" || muted) &&
                      MUTE_DURATIONS.map((option) => (
                        <Pressable
                          key={option.label}
                          style={styles.action}
                          onPress={() =>
                            run("mute_chat_member", {
                              p_room_id: roomId,
                              p_profile_id: member.profile_id,
                              p_muted_until: muteUntilIso(option.hours),
                            })
                          }
                        >
                          <Text style={styles.actionText}>Mute {option.label}</Text>
                        </Pressable>
                      ))}
                    {muted && (
                      <Pressable
                        style={styles.action}
                        onPress={() =>
                          run("unmute_chat_member", { p_room_id: roomId, p_profile_id: member.profile_id })
                        }
                      >
                        <Text style={styles.actionText}>Unmute</Text>
                      </Pressable>
                    )}
                    {(member.status === "active" || muted) && (
                      <>
                        <Pressable
                          style={styles.danger}
                          onPress={() =>
                            run("kick_chat_member", { p_room_id: roomId, p_profile_id: member.profile_id })
                          }
                        >
                          <Text style={styles.dangerText}>Remove</Text>
                        </Pressable>
                        <Pressable
                          style={styles.danger}
                          onPress={() =>
                            run("block_chat_member", { p_room_id: roomId, p_profile_id: member.profile_id })
                          }
                        >
                          <Text style={styles.dangerText}>Block</Text>
                        </Pressable>
                      </>
                    )}
                    {member.status === "removed" && (
                      <Pressable
                        style={styles.action}
                        onPress={() =>
                          run("add_chat_member", { p_room_id: roomId, p_profile_id: member.profile_id })
                        }
                      >
                        <Text style={styles.actionText}>Add back</Text>
                      </Pressable>
                    )}
                    {member.status === "blocked" && (
                      <Pressable
                        style={styles.action}
                        onPress={() =>
                          run("unblock_chat_member", { p_room_id: roomId, p_profile_id: member.profile_id })
                        }
                      >
                        <Text style={styles.actionText}>Unblock</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.black },
  bubbleWrap: { marginBottom: 12 },
  bubble: { maxWidth: "84%", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  mine: { backgroundColor: colors.blue },
  theirs: { backgroundColor: colors.dark },
  body: { color: colors.gray },
  sender: { color: colors.gold, fontSize: 11, marginBottom: 4, fontWeight: "700" },
  system: { color: colors.muted, textAlign: "center", marginVertical: 8, fontSize: 12 },
  delete: { color: colors.muted, fontSize: 11, marginTop: 4 },
  composer: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: "#0D74D133" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#0D74D133",
    borderRadius: 10,
    color: colors.gray,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.dark,
  },
  send: { backgroundColor: colors.gold, borderRadius: 10, justifyContent: "center", paddingHorizontal: 16 },
  sendText: { color: colors.black, fontWeight: "800" },
  error: { color: colors.red, paddingHorizontal: 16, paddingBottom: 6 },
  mutedBanner: { color: colors.gold, paddingHorizontal: 16, paddingBottom: 6 },
  modal: { flex: 1, backgroundColor: colors.black, paddingTop: 56, paddingHorizontal: 16 },
  close: { color: colors.gold, fontWeight: "800", marginBottom: 12 },
  modalTitle: { color: colors.gray, fontSize: 22, fontWeight: "800", textTransform: "uppercase", marginBottom: 12 },
  member: {
    borderWidth: 1,
    borderColor: "#0D74D122",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    backgroundColor: colors.dark,
  },
  caption: { color: colors.muted, fontSize: 12, marginTop: 4, textTransform: "uppercase" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  action: { backgroundColor: "#0D74D133", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  actionText: { color: colors.gray, fontSize: 11, fontWeight: "700" },
  danger: { backgroundColor: "#E5393533", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  dangerText: { color: "#FCA5A5", fontSize: 11, fontWeight: "700" },
});
