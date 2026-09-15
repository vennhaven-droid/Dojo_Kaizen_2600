import { ScrollView, StyleSheet, Text } from "react-native";
import { Link } from "expo-router";
import { Pressable } from "react-native";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/Colors";
import { canSeeNavItem } from "@/lib/permissions-lite";

const SECTIONS = [
  { id: "students", href: "/admin/students", label: "Students" },
  { id: "enrollments", href: "/admin/enrollments", label: "Enrollments" },
  { id: "inquiries", href: "/admin/inquiries", label: "Inquiries" },
  { id: "payments", href: "/admin/payments", label: "Payments" },
  { id: "attendance", href: "/admin/attendance", label: "Attendance" },
  { id: "users", href: "/admin/users", label: "Users" },
  { id: "programs", href: "/admin/programs", label: "Programs" },
  { id: "coaches", href: "/admin/coaches", label: "Coaches" },
  { id: "pricing", href: "/admin/pricing", label: "Pricing" },
  { id: "lockers", href: "/admin/lockers", label: "Lockers" },
  { id: "competitions", href: "/admin/competitions", label: "Competitions" },
] as const;

export default function AdminHome() {
  const { me } = useAuth();
  const role = me?.profile.role ?? "STUDENT";
  const visible = SECTIONS.filter((item) => canSeeNavItem(item.href, role, me?.permissions ?? null));

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.page}>
      <Text style={styles.title}>Dojo ops</Text>
      <Text style={styles.muted}>Daily records stay in the app. Website CMS is still edited on the site.</Text>
      {visible.map((item) => (
        <Link key={item.id} href={{ pathname: "/(tabs)/admin/[section]", params: { section: item.id } }} asChild>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>{item.label}</Text>
          </Pressable>
        </Link>
      ))}
      {visible.length === 0 ? <Text style={styles.muted}>No admin permissions on this login.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.black },
  page: { padding: 20, paddingBottom: 40 },
  title: { color: colors.gray, fontSize: 28, fontWeight: "800", textTransform: "uppercase" },
  muted: { color: colors.muted, marginTop: 8, marginBottom: 16, lineHeight: 20 },
  card: {
    backgroundColor: colors.dark,
    borderColor: "#0D74D133",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardTitle: { color: colors.gray, fontWeight: "800", textTransform: "uppercase" },
});
