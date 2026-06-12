import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getParentStudentIds } from "@/lib/access";
import { MetricCard } from "@/components/portals/portal-shell";
import { formatPeso } from "@/lib/utils";
import Link from "next/link";

export default async function ParentDashboard() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const studentIds = await getParentStudentIds(profile.id);
  const supabase = await createClient();

  const { data: children } = await supabase
    ?.from("students")
    .select("*, student_stats(*), memberships(status, programs(name))")
    .in("id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]) ?? { data: [] };

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">My Children</h2>
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
    </div>
  );
}
