import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/Colors";

function peso(amount: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(
    amount
  );
}

export default function BillingScreen() {
  const { me } = useAuth();
  const students = me?.students ?? [];

  if (students.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Billing</Text>
        <Text style={styles.muted}>No membership or payment records are linked to this login.</Text>
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
          <View style={styles.card}>
            <Text style={styles.label}>Balance due</Text>
            <Text style={[styles.amount, { color: student.balance > 0 ? colors.red : colors.green }]}>
              {student.balance > 0 ? peso(student.balance) : "Paid up"}
            </Text>
            {student.due_date ? (
              <Text style={styles.muted}>Next due {new Date(student.due_date).toLocaleDateString()}</Text>
            ) : null}
          </View>
          {student.memberships.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.label}>Memberships</Text>
              {student.memberships.map((m) => (
                <Text key={m.id} style={styles.row}>
                  {m.program_name ?? m.type} · {m.status}
                  {m.due_date ? ` · due ${new Date(m.due_date).toLocaleDateString()}` : ""}
                </Text>
              ))}
            </View>
          )}
          <Text style={styles.label}>Payment history</Text>
          {student.payments.length === 0 ? (
            <Text style={styles.muted}>No payments recorded yet. Pay at the front desk.</Text>
          ) : (
            student.payments.map((p) => (
              <View key={p.id} style={styles.pay}>
                <Text style={styles.payAmt}>{peso(p.amount)}</Text>
                <Text style={styles.muted}>
                  {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "Unpaid"} · {p.method} ·{" "}
                  {p.payment_status ?? "PAID"}
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
  block: { marginBottom: 28 },
  title: { color: colors.gray, fontSize: 24, fontWeight: "800", textTransform: "uppercase" },
  card: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#0D74D133",
    backgroundColor: colors.dark,
    borderRadius: 16,
    padding: 18,
  },
  label: { color: colors.gold, fontWeight: "800", textTransform: "uppercase", marginTop: 16, letterSpacing: 0.6 },
  amount: { fontSize: 28, fontWeight: "800", marginTop: 6 },
  muted: { color: colors.muted, marginTop: 8, lineHeight: 20 },
  row: { color: colors.gray, marginTop: 8 },
  pay: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#0D74D122",
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.dark,
  },
  payAmt: { color: colors.gray, fontWeight: "800", fontSize: 16 },
});
