import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "@/context/auth";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { colors } from "@/constants/Colors";

export default function ProfileScreen() {
  const { me, session, signOut, refreshMe } = useAuth();
  const student = me?.students[0];
  const name = `${me?.profile.first_name ?? ""} ${me?.profile.last_name ?? ""}`.trim() || "Member";
  const [phone, setPhone] = useState(student?.phone ?? "");
  const [birthday, setBirthday] = useState(student?.birthday ?? "");
  const [address, setAddress] = useState(student?.address ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const canEditStudent = Boolean(student) && (me?.profile.role === "STUDENT" || me?.profile.role === "PARENT");

  const announcements = me?.announcements ?? [];

  useEffect(() => {
    setPhone(student?.phone ?? "");
    setBirthday(student?.birthday ?? "");
    setAddress(student?.address ?? "");
  }, [student?.id, student?.phone, student?.birthday, student?.address]);

  async function saveProfile() {
    if (!session?.access_token || !student) return;
    setSaving(true);
    setMessage("");
    try {
      await apiFetch("/api/me/profile", session.access_token, {
        method: "PATCH",
        body: { student_id: student.id, phone, birthday, address },
      });
      await refreshMe();
      setMessage("Profile saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setMessage("Password updated.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.kicker}>{me?.profile.role}</Text>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.muted}>{me?.profile.email}</Text>

      {announcements.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.label}>{item.title}</Text>
          <Text style={styles.muted}>{item.body}</Text>
        </View>
      ))}

      {canEditStudent ? (
        <View style={styles.card}>
          <Text style={styles.label}>My profile</Text>
          <Text style={styles.muted}>
            {student?.first_name} {student?.last_name}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor={colors.muted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Birthday (YYYY-MM-DD)"
            placeholderTextColor={colors.muted}
            value={birthday}
            onChangeText={setBirthday}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor={colors.muted}
            value={address}
            onChangeText={setAddress}
          />
          <Pressable style={styles.gold} onPress={() => void saveProfile()} disabled={saving}>
            <Text style={styles.goldText}>{saving ? "Saving…" : "Save changes"}</Text>
          </Pressable>
          <Text style={styles.hint}>Changes are logged and visible to staff.</Text>
        </View>
      ) : (
        <Text style={styles.hint}>Account tools stay in this app. Staff use the Admin tab for dojo records.</Text>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Change password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="New password"
            placeholderTextColor={colors.muted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.show}>
            <Text style={styles.showText}>{showPassword ? "Hide" : "Show"}</Text>
          </Pressable>
        </View>
        <Pressable style={styles.blue} onPress={() => void savePassword()} disabled={saving}>
          <Text style={styles.blueText}>Update password</Text>
        </Pressable>
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable style={styles.button} onPress={() => void signOut()}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.black },
  page: { padding: 24, paddingBottom: 48 },
  kicker: { color: colors.gold, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  title: { color: colors.gray, fontSize: 28, fontWeight: "800", textTransform: "uppercase", marginTop: 8 },
  muted: { color: colors.muted, marginTop: 8, lineHeight: 20 },
  hint: { color: colors.muted, marginTop: 12, lineHeight: 20, fontSize: 12 },
  card: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#0D74D133",
    backgroundColor: colors.dark,
    borderRadius: 16,
    padding: 16,
  },
  label: { color: colors.gold, fontWeight: "800", textTransform: "uppercase" },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#0D74D133",
    borderRadius: 10,
    color: colors.gray,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 4,
  },
  passwordRow: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 },
  show: { paddingHorizontal: 8, paddingVertical: 12 },
  showText: { color: colors.blue, fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  gold: {
    marginTop: 16,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  goldText: { color: colors.black, fontWeight: "800", textTransform: "uppercase" },
  blue: {
    marginTop: 16,
    backgroundColor: colors.blue,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  blueText: { color: "#fff", fontWeight: "800", textTransform: "uppercase" },
  message: { color: colors.gray, marginTop: 16, textAlign: "center" },
  button: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#0D74D155",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { color: colors.gray, fontWeight: "800", textTransform: "uppercase" },
});
