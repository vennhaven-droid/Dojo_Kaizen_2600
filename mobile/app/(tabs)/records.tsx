import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/Colors";
import { formatTime } from "@/lib/format";

export default function RecordsScreen() {
  const { me } = useAuth();
  const students = me?.students ?? [];

  if (students.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Records</Text>
        <Text style={styles.muted}>No student records are linked to this login.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.page}>
      {students.map((student) => (
        <View key={student.id} style={styles.block}>
          <Text style={styles.title}>
            {student.first_name} {student.last_name}
          </Text>

          <Text style={styles.label}>Attendance</Text>
          {(student.attendance ?? []).length === 0 ? (
            <Text style={styles.muted}>No attendance yet.</Text>
          ) : (
            (student.attendance ?? []).map((row) => (
              <View key={row.id} style={styles.row}>
                <Text style={styles.rowTitle}>{row.date}</Text>
                <Text style={styles.muted}>
                  In {formatTime(row.checked_in_at)} · Out {formatTime(row.checked_out_at)}
                </Text>
              </View>
            ))
          )}

          <Text style={styles.label}>Achievements</Text>
          <View style={styles.wrap}>
            {(student.achievements ?? []).map((a) => (
              <View key={a.id} style={[styles.badge, a.earned ? styles.badgeOn : styles.badgeOff]}>
                <Text style={styles.badgeText}>
                  {a.icon ? `${a.icon} ` : ""}
                  {a.name}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.label}>Competitions</Text>
          {(student.competitions ?? []).length === 0 ? (
            <Text style={styles.muted}>No competition records yet.</Text>
          ) : (
            (student.competitions ?? []).map((c) => (
              <View key={c.id} style={styles.row}>
                <Text style={styles.rowTitle}>{c.name}</Text>
                <Text style={styles.muted}>
                  {[c.date, c.division, c.result, c.medal].filter(Boolean).join(" · ")}
                </Text>
              </View>
            ))
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.black },
  page: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: colors.black, padding: 24, justifyContent: "center" },
  block: { marginBottom: 32 },
  title: { color: colors.gray, fontSize: 24, fontWeight: "800", textTransform: "uppercase" },
  label: { color: colors.gold, fontWeight: "800", textTransform: "uppercase", marginTop: 20, marginBottom: 8 },
  muted: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  row: {
    borderWidth: 1,
    borderColor: "#0D74D133",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.dark,
  },
  rowTitle: { color: colors.gray, fontWeight: "700" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  badgeOn: { borderColor: colors.gold, backgroundColor: "#F2C94C22" },
  badgeOff: { borderColor: "#0D74D133", opacity: 0.5 },
  badgeText: { color: colors.gray, fontWeight: "700", fontSize: 12 },
});
