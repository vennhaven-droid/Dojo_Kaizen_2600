import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CoachDashboard() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: coach } = await supabase
    ?.from("coaches")
    .select("id")
    .eq("profile_id", profile?.id ?? "")
    .single() ?? { data: null };

  const { data: openLog } = await supabase
    ?.from("coach_time_logs")
    .select("*")
    .eq("coach_id", coach?.id ?? "")
    .is("time_out", null)
    .limit(1)
    .maybeSingle() ?? { data: null };

  const { count: studentCount } = await supabase
    ?.from("coach_students")
    .select("*", { count: "exact", head: true })
    .eq("coach_id", coach?.id ?? "") ?? { count: 0 };

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">Coach Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-5">
          <p className="text-sm text-kaizen-muted">Assigned Students</p>
          <p className="text-3xl font-bold">{studentCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-5">
          <p className="text-sm text-kaizen-muted">Clock Status</p>
          <p className="text-lg font-bold text-gold">{openLog ? "Clocked In" : "Clocked Out"}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="gold"><Link href="/coach/time">Time Log</Link></Button>
        <Button asChild variant="secondary"><Link href="/coach/plans">Session Plans</Link></Button>
        <Button asChild variant="secondary"><Link href="/coach/students">Student Notes</Link></Button>
      </div>
    </div>
  );
}
