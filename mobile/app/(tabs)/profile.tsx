import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/Colors";
import { manageAccountUrl } from "@/lib/links";

export default function ProfileScreen() {
  const { me, signOut } = useAuth();
  const name = `${me?.profile.first_name ?? ""} ${me?.profile.last_name ?? ""}`.trim() || "Member";
  const accountUrl = manageAccountUrl(me?.profile.role);

  return (
    <View style={styles.page}>
      <Text style={styles.kicker}>{me?.profile.role}</Text>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.muted}>{me?.profile.email}</Text>
      <Text style={styles.hint}>
        User accounts, CMS, and other admin tools stay on the website.
      </Text>
      <Pressable style={styles.primary} onPress={() => void Linking.openURL(accountUrl)}>
        <Text style={styles.primaryText}>Manage account</Text>
      </Pressable>
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
  hint: { color: colors.muted, marginTop: 20, lineHeight: 20 },
  primary: {
    marginTop: 28,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: { color: colors.black, fontWeight: "800", textTransform: "uppercase" },
  button: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#0D74D155",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { color: colors.gray, fontWeight: "800", textTransform: "uppercase" },
});
