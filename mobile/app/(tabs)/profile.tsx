import { useAuth } from "@/context/auth";
import { colors } from "@/constants/Colors";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const { me, signOut } = useAuth();
  const name = `${me?.profile.first_name ?? ""} ${me?.profile.last_name ?? ""}`.trim() || "Member";

  return (
    <View style={styles.page}>
      <Text style={styles.kicker}>{me?.profile.role}</Text>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.muted}>{me?.profile.email}</Text>
      <Pressable style={styles.button} onPress={() => void signOut()}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.black, padding: 24 },
  kicker: { color: colors.gold, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  title: { color: colors.gray, fontSize: 28, fontWeight: "800", textTransform: "uppercase", marginTop: 8 },
  muted: { color: colors.muted, marginTop: 8 },
  button: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: "#0D74D155",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: colors.gray, fontWeight: "800", textTransform: "uppercase" },
});
