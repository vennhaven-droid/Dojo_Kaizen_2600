import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/auth";
import { apiFetch } from "@/lib/api";
import { colors } from "@/constants/Colors";

const TITLES: Record<string, string> = {
  students: "Students",
  enrollments: "Enrollments",
  inquiries: "Inquiries",
  payments: "Payments",
  attendance: "Attendance",
  users: "Users",
  programs: "Programs",
  coaches: "Coaches",
  pricing: "Pricing",
  lockers: "Lockers",
  competitions: "Competitions",
};

function asList(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function nameOf(row: Record<string, unknown>) {
  const nested = row.students as { first_name?: string; last_name?: string } | undefined;
  if (nested?.first_name) return `${nested.first_name} ${nested.last_name ?? ""}`.trim();
  const profile = row.profiles as { first_name?: string; last_name?: string } | undefined;
  if (profile?.first_name) return `${profile.first_name} ${profile.last_name ?? ""}`.trim();
  return `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || String(row.name ?? row.email ?? row.title ?? "—");
}

export default function AdminSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const key = section ?? "students";
  const { session } = useAuth();
  const [data, setData] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [studentId, setStudentId] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!session?.access_token) return;
    setError("");
    setLoading(true);
    try {
      const path = `/api/admin/ops?section=${encodeURIComponent(key)}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
      setData(await apiFetch(path, session.access_token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [key, q, session?.access_token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function post(body: Record<string, unknown>) {
    if (!session?.access_token) return;
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/admin/ops", session.access_token, { method: "POST", body });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  const list =
    key === "students"
      ? asList(data.students)
      : key === "enrollments"
        ? asList(data.enrollments)
        : key === "inquiries"
          ? asList(data.inquiries)
          : key === "payments"
            ? asList(data.payments)
            : key === "attendance"
              ? asList(data.attendance)
              : key === "users"
                ? asList(data.users)
                : key === "programs"
                  ? asList(data.programs)
                  : key === "coaches"
                    ? asList(data.coaches)
                    : key === "pricing"
                      ? asList(data.pricing)
                      : key === "lockers"
                        ? asList(data.lockers)
                        : asList(data.competitions);

  const people = asList(data.students);

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: TITLES[key] ?? "Admin" }} />
      {key === "students" ? (
        <TextInput
          style={styles.input}
          placeholder="Search name or email"
          placeholderTextColor={colors.muted}
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => void load()}
        />
      ) : null}

      {key === "payments" ? (
        <View style={styles.card}>
          <Text style={styles.label}>Record payment</Text>
          <TextInput
            style={styles.input}
            placeholder="Student id (or pick below)"
            placeholderTextColor={colors.muted}
            value={studentId}
            onChangeText={setStudentId}
          />
          <ScrollView horizontal>
            {people.map((s) => (
              <Pressable key={String(s.id)} style={styles.chip} onPress={() => setStudentId(String(s.id))}>
                <Text style={styles.chipText}>{nameOf(s)}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Pressable
            style={styles.gold}
            disabled={busy}
            onPress={() => void post({ action: "record_payment", student_id: studentId, amount: Number(amount), method: "CASH" })}
          >
            <Text style={styles.goldText}>Save cash payment</Text>
          </Pressable>
        </View>
      ) : null}

      {key === "attendance" ? (
        <View style={styles.card}>
          <Text style={styles.label}>Check in a student</Text>
          {people.map((s) => (
            <View key={String(s.id)} style={styles.rowBtns}>
              <Text style={styles.rowTitle}>{nameOf(s)}</Text>
              <Pressable style={styles.smallGold} onPress={() => void post({ action: "checkin", student_id: s.id })}>
                <Text style={styles.goldText}>In</Text>
              </Pressable>
              <Pressable style={styles.smallBlue} onPress={() => void post({ action: "checkout", student_id: s.id })}>
                <Text style={styles.blueText}>Out</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {key === "users" ? (
        <View style={styles.card}>
          <Text style={styles.label}>Create login</Text>
          <TextInput style={styles.input} placeholder="First name" placeholderTextColor={colors.muted} value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Last name" placeholderTextColor={colors.muted} value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.muted} autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Temp password" placeholderTextColor={colors.muted} secureTextEntry value={password} onChangeText={setPassword} />
          <View style={styles.wrap}>
            {["STUDENT", "PARENT", "COACH", "ADMIN"].map((item) => (
              <Pressable key={item} style={[styles.chip, role === item && styles.chipOn]} onPress={() => setRole(item)}>
                <Text style={styles.chipText}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={styles.gold}
            disabled={busy}
            onPress={() =>
              void post({
                action: "create_user",
                email,
                password,
                first_name: firstName,
                last_name: lastName,
                role,
              })
            }
          >
            <Text style={styles.goldText}>Create account</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: 24 }} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {list.map((row) => (
        <View key={String(row.id ?? nameOf(row))} style={styles.card}>
          <Text style={styles.rowTitle}>{nameOf(row)}</Text>
          <Text style={styles.muted}>
            {[row.status, row.email, row.role, row.phone, row.date, row.payment_status, row.result]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          {typeof row.amount === "number" || typeof row.amount === "string" ? (
            <Text style={styles.muted}>₱{String(row.amount)}</Text>
          ) : null}
          {key === "enrollments" ? (
            <View style={styles.wrap}>
              {["NEW", "CONTACTED", "ENROLLED", "NOT_PROCEEDING"].map((status) => (
                <Pressable
                  key={status}
                  style={styles.chip}
                  onPress={() => void post({ action: "update_enrollment", id: row.id, status })}
                >
                  <Text style={styles.chipText}>{status}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.chip} onPress={() => void post({ action: "archive_enrollment", id: row.id })}>
                <Text style={styles.chipText}>Archive</Text>
              </Pressable>
            </View>
          ) : null}
          {key === "inquiries" ? (
            <View style={styles.wrap}>
              <Text style={styles.muted}>{String(row.message ?? "")}</Text>
              {["NEW", "READ", "REPLIED", "CLOSED"].map((status) => (
                <Pressable
                  key={status}
                  style={styles.chip}
                  onPress={() => void post({ action: "update_inquiry", id: row.id, status })}
                >
                  <Text style={styles.chipText}>{status}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.black },
  page: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.dark,
    borderColor: "#0D74D133",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  label: { color: colors.gold, fontWeight: "800", textTransform: "uppercase", marginBottom: 8 },
  rowTitle: { color: colors.gray, fontWeight: "800" },
  muted: { color: colors.muted, marginTop: 6, lineHeight: 18 },
  error: { color: colors.red, marginVertical: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#0D74D133",
    borderRadius: 10,
    color: colors.gray,
    padding: 12,
    marginBottom: 10,
  },
  gold: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 8 },
  goldText: { color: colors.black, fontWeight: "800", textTransform: "uppercase" },
  blueText: { color: "#fff", fontWeight: "800", textTransform: "uppercase" },
  smallGold: { backgroundColor: colors.gold, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  smallBlue: { backgroundColor: colors.blue, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  rowBtns: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { borderWidth: 1, borderColor: "#0D74D155", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipOn: { backgroundColor: "#0D74D133" },
  chipText: { color: colors.gray, fontSize: 12, fontWeight: "700" },
});
