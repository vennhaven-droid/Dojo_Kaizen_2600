import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getParentStudentIds } from "@/lib/access";
import { formatPeso } from "@/lib/utils";

export default async function ParentPaymentsPage() {
  const profile = await getCurrentProfile();
  const studentIds = await getParentStudentIds(profile?.id ?? "");
  const supabase = await createClient();
  const { data } = await supabase
    ?.from("payments")
    .select("*, students(first_name, last_name)")
    .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"])
    .order("paid_at", { ascending: false })
    .limit(30) ?? { data: [] };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Payment History</h2>
      <ul className="space-y-2 text-sm">
        {(data ?? []).map((p) => {
          const s = p.students as { first_name?: string; last_name?: string } | null;
          return (
            <li key={p.id} className="flex justify-between rounded-lg border border-blue/20 p-3">
              <span>{s?.first_name} · {new Date(p.paid_at).toLocaleDateString()} · {p.method}</span>
              <span className="text-gold">{formatPeso(Number(p.amount))}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
