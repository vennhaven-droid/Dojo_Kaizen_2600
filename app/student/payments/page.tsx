import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getStudentForUser } from "@/lib/access";
import { formatPeso, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/portals/portal-shell";

export default async function StudentPaymentsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const student = await getStudentForUser(profile.id);
  if (!student) {
    return <p className="text-kaizen-muted">No student profile linked.</p>;
  }

  const supabase = await createClient();
  const { data: payments } = await supabase
    ?.from("payments")
    .select("*")
    .eq("student_id", student.id)
    .order("paid_at", { ascending: false }) ?? { data: [] };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">My Payments</h2>
      <div className="overflow-x-auto rounded-xl border border-blue/20">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-blue/20 bg-kaizen-black/50 text-kaizen-muted">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Method</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p) => (
              <tr key={p.id} className="border-b border-blue/10">
                <td className="px-4 py-3">{formatDate(p.paid_at)}</td>
                <td className="px-4 py-3 font-medium">{formatPeso(Number(p.amount))}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.payment_status ?? "PAID"} />
                </td>
                <td className="px-4 py-3 uppercase text-xs">{p.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(payments ?? []).length === 0 && (
          <p className="p-8 text-center text-kaizen-muted">No payment records yet.</p>
        )}
      </div>
    </div>
  );
}
