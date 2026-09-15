import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth";
import { CHAT_VISIBILITY_LABELS, type ChatRoomVisibility } from "@/lib/chat";
import { colors } from "@/constants/Colors";

type Room = {
  id: string;
  name: string;
  description: string | null;
  visibility: ChatRoomVisibility;
  is_archived: boolean;
};

export default function ChatListScreen() {
  const { me } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setError("");
    await supabase.rpc("sync_my_chat_memberships");
    const { data, error: roomsError } = await supabase.from("chat_rooms").select("*").order("name");
    if (roomsError) setError(roomsError.message);
    setRooms((data ?? []) as Room[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("mobile-chat-rooms")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_rooms" }, () => {
        void load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_members" }, () => {
        void load();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  return (
    <View style={styles.page}>
      {me?.canManageChat && (
        <Pressable style={styles.newBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.newBtnText}>New room</Text>
        </Pressable>
      )}
      {loading ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={<Text style={styles.muted}>No chat rooms yet.</Text>}
          renderItem={({ item }) => (
            <Link href={{ pathname: "/(tabs)/chat/[roomId]", params: { roomId: item.id, name: item.name } }} asChild>
              <Pressable style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.muted}>
                  {CHAT_VISIBILITY_LABELS[item.visibility]}
                  {item.is_archived ? " · Archived" : ""}
                </Text>
              </Pressable>
            </Link>
          )}
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <CreateRoomModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(roomId, name) => {
          setShowCreate(false);
          void load();
          if (roomId) {
            router.push({ pathname: "/(tabs)/chat/[roomId]", params: { roomId, name: name ?? "Chat" } });
          }
        }}
      />
    </View>
  );
}

function CreateRoomModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: (roomId?: string, name?: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ChatRoomVisibility>("INVITE");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function create() {
    setPending(true);
    setError("");
    const { data, error: createError } = await supabase.rpc("create_chat_room", {
      p_name: name.trim(),
      p_description: description.trim() || null,
      p_visibility: visibility,
    });
    setPending(false);
    if (createError) {
      setError(createError.message);
      return;
    }
    const room = (Array.isArray(data) ? data[0] : data) as { id?: string; name?: string } | null;
    const createdName = name.trim();
    setName("");
    setDescription("");
    onCreated(room?.id, room?.name ?? createdName);
  }

  function dismiss() {
    setError("");
    setName("");
    setDescription("");
    setVisibility("INVITE");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={dismiss}>
      <Pressable style={styles.modalBg} onPress={dismiss}>
        <Pressable style={styles.modal} onPress={() => undefined}>
          <Text style={styles.name}>New room</Text>
          <TextInput
            placeholder="Name"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Description (optional)"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={description}
            onChangeText={setDescription}
          />
          {(Object.keys(CHAT_VISIBILITY_LABELS) as ChatRoomVisibility[]).map((key) => (
            <Pressable key={key} onPress={() => setVisibility(key)} style={styles.option}>
              <Text style={{ color: visibility === key ? colors.gold : colors.gray }}>
                {CHAT_VISIBILITY_LABELS[key]}
              </Text>
            </Pressable>
          ))}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.gold} onPress={create} disabled={pending || !name.trim()}>
            <Text style={styles.goldText}>{pending ? "Creating…" : "Create"}</Text>
          </Pressable>
          <Pressable style={styles.cancel} onPress={dismiss} disabled={pending}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.black },
  card: {
    backgroundColor: colors.dark,
    borderColor: "#0D74D133",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  name: { color: colors.gray, fontWeight: "800", fontSize: 18, textTransform: "uppercase" },
  muted: { color: colors.muted, marginTop: 4 },
  error: { color: colors.red, padding: 16 },
  newBtn: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  newBtnText: { color: colors.black, fontWeight: "800", textTransform: "uppercase" },
  modalBg: { flex: 1, backgroundColor: "#00000099", justifyContent: "flex-end" },
  modal: {
    backgroundColor: colors.dark,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#0D74D133",
    borderRadius: 10,
    color: colors.gray,
    padding: 12,
    marginTop: 12,
  },
  option: { paddingVertical: 10 },
  gold: {
    marginTop: 16,
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  goldText: { color: colors.black, fontWeight: "800", textTransform: "uppercase" },
  cancel: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#0D74D155",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: { color: colors.gray, fontWeight: "800", textTransform: "uppercase" },
});
