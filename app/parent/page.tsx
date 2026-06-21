import Link from "next/link";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getParentStudentIds } from "@/lib/access";
import { formatPeso } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function ParentDashboard() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const studentIds = await getParentStudentIds(profile.id);
  const supabase = await createClient();

  const { data: children } = await supabase
    ?.from("students")
    .select("*, student_stats(*), memberships(status, programs(name))")
    .in("id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]) ?? { data: [] };

  const { data: recentPayments } = await supabase
    ?.from("payments")
    .select("*, students(first_name)")
    .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"])
    .order("paid_at", { ascending: false })
    .limit(5) ?? { data: [] };

  const { data: announcements } = await supabase
    ?.from("announcements")
    .select("*")
    .eq("is_published", true)
    .in("audience", ["ALL", "PARENTS"])
    .order("published_at", { ascending: false })
    .limit(3) ?? { data: [] };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Parent Portal</h2>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm"><Link href="/parent/attendance">Attendance</Link></Button>
          <Button asChild variant="secondary" size="sm"><Link href="/parent/payments">Payments</Link></Button>
        </div>
      </div>

      {(announcements ?? []).length > 0 && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-6">
          <h3 className="font-display text-lg text-gold">Announcements</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {(announcements ?? []).map((a) => (
              <li key={a.id}>
                <p className="font-semibold">{a.title}</p>
                <p className="text-kaizen-muted">{a.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h3 className="font-display text-xl font-bold">My Children</h3>
      {children?.length === 0 ? (
        <p className="text-kaizen-muted">No children linked to your account yet. Contact the academy to link your children.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {(children ?? []).map((child) => {
            const stats = child.student_stats as { total_visits?: number; current_streak?: number; last_visit?: string } | null;
            const memberships = child.memberships as Array<{ status?: string; programs?: { name?: string } }> | null;
            return (
              <div key={child.id} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
                <h3 className="font-display text-xl font-bold text-gold">
                  {child.first_name} {child.last_name}
                </h3>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                  <div><p className="text-kaizen-muted">Visits</p><p className="text-xl font-bold">{stats?.total_visits ?? 0}</p></div>
                  <div><p className="text-kaizen-muted">Streak</p><p className="text-xl font-bold streak-fire">{stats?.current_streak ?? 0}</p></div>
                  <div><p className="text-kaizen-muted">Last Visit</p><p className="text-sm font-bold">{stats?.last_visit ?? "—"}</p></div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-kaizen-muted uppercase">Programs</p>
                  <p className="text-sm">{(memberships ?? []).map((m) => m.programs?.name).filter(Boolean).join(", ") || "None"}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(recentPayments ?? []).length > 0 && (
        <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
          <h3 className="font-display text-lg text-gold">Recent Payments</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {(recentPayments ?? []).map((p) => {
              const s = p.students as { first_name?: string } | null;
              return (
                <li key={p.id} className="flex justify-between">
                  <span>{s?.first_name} · {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "Due"}</span>
                  <span className="text-gold">{formatPeso(Number(p.amount))}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
