import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/auth";
import { apiFetch } from "@/lib/api";
import { colors } from "@/constants/Colors";

export default function TrainScreen() {
  const { me, session, refreshMe } = useAuth();
  const students = me?.students ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const student = useMemo(() => {
    if (students.length === 0) return null;
    return students.find((s) => s.id === (selectedId ?? students[0].id)) ?? students[0];
  }, [selectedId, students]);

  async function call(path: string) {
    if (!session?.access_token || !student) return;
    setLoading(true);
    setMessage("");
    try {
      const result = await apiFetch<{ success: boolean; message: string; warning?: string }>(
        path,
        session.access_token,
        { method: "POST", body: { student_id: student.id, method: "LOGIN" } }
      );
      setMessage([result.message, result.warning].filter(Boolean).join(" — "));
      await refreshMe();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  if (!student) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Train</Text>
        <Text style={styles.muted}>
          No student profile is linked to this login. Staff can still use Chat. Members should contact the front desk.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page} style={styles.bg}>
      <Text style={styles.kicker}>Today</Text>
      <Text style={styles.title}>
        {student.first_name} {student.last_name}
      </Text>
      {students.length > 1 && (
        <View style={styles.rowWrap}>
          {students.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setSelectedId(s.id)}
              style={[styles.chip, (selectedId ?? students[0].id) === s.id && styles.chipOn]}
            >
              <Text style={styles.chipText}>{s.first_name}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <View style={styles.card}>
        <Text style={styles.muted}>Status</Text>
        <Text style={styles.status}>
          {!student.checked_in
            ? "Not checked in"
            : student.checked_out
              ? "Session complete"
              : "Training now"}
        </Text>
      </View>
      {!student.checked_in && (
        <Pressable style={styles.gold} disabled={loading} onPress={() => call("/api/attendance/checkin")}>
          <Text style={styles.goldText}>{loading ? "…" : "Train today — check in"}</Text>
        </Pressable>
      )}
      {student.checked_in && !student.checked_out && (
        <Pressable style={styles.blue} disabled={loading} onPress={() => call("/api/attendance/checkout")}>
          <Text style={styles.blueText}>{loading ? "…" : "Finish session — check out"}</Text>
        </Pressable>
      )}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.black },
  page: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: colors.black, padding: 24, justifyContent: "center" },
  kicker: { color: colors.gold, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  title: { color: colors.gray, fontSize: 28, fontWeight: "800", textTransform: "uppercase", marginTop: 6 },
  muted: { color: colors.muted, marginTop: 12, lineHeight: 20 },
  card: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#0D74D133",
    backgroundColor: colors.dark,
    borderRadius: 16,
    padding: 20,
  },
  status: { color: colors.gray, fontSize: 22, fontWeight: "800", marginTop: 6 },
  gold: {
    marginTop: 24,
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  goldText: { color: colors.black, fontWeight: "800", textTransform: "uppercase", fontSize: 16 },
  blue: {
    marginTop: 24,
    backgroundColor: colors.blue,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  blueText: { color: "#fff", fontWeight: "800", textTransform: "uppercase", fontSize: 16 },
  message: { color: colors.gray, marginTop: 16, textAlign: "center" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  chip: {
    borderWidth: 1,
    borderColor: "#0D74D133",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: "#0D74D133", borderColor: colors.blue },
  chipText: { color: colors.gray, fontWeight: "700" },
});
