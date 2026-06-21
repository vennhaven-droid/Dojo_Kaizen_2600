import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getStudentForUser } from "@/lib/access";
import { getStudentMemberships } from "@/lib/memberships";
import { getStudentBalance } from "@/lib/payments";
import { TrainTodayButton } from "@/components/portals/train-today-button";
import { Badge } from "@/components/ui/badge";
import { todayISO } from "@/lib/utils";

export default async function StudentDashboard() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const student = await getStudentForUser(profile.id);
  if (!student) {
    return <p className="text-kaizen-muted">No student profile linked to your account.</p>;
  }

  const supabase = await createClient();
  const [memberships, balance, { data: achievements }] = await Promise.all([
    getStudentMemberships(student.id),
    getStudentBalance(student.id),
    supabase?.from("student_achievements").select("*, achievements(name, icon)").eq("student_id", student.id) ?? { data: [] },
  ]);

  const { data: stats } = await supabase
    ?.from("student_stats")
    .select("*")
    .eq("student_id", student.id)
    .single() ?? { data: null };

  const { data: todayAttendance } = await supabase
    ?.from("attendance")
    .select("checked_out_at")
    .eq("student_id", student.id)
    .eq("date", todayISO())
    .maybeSingle() ?? { data: null };

  const xp = stats?.xp_points ?? 0;
  const level = stats?.level ?? 1;
  const xpProgress = (xp % 100);

  return (
    <div className="space-y-8 pb-24 lg:pb-8">
      <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-blue/10 to-gold/5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue/20 font-display text-2xl font-bold text-blue">
            {student.first_name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">{student.first_name} {student.last_name}</h2>
            <p className="text-gold">Level {level} · {xp} XP</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-kaizen-black">
          <div className="h-2 rounded-full bg-gold transition-all" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-4 text-center">
          <p className="text-xs text-kaizen-muted">Visits</p>
          <p className="text-2xl font-bold">{stats?.total_visits ?? 0}</p>
        </div>
        <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-4 text-center">
          <p className="text-xs text-kaizen-muted">Streak</p>
          <p className="text-2xl font-bold streak-fire">{stats?.current_streak ?? 0}</p>
        </div>
        <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-4 text-center">
          <p className="text-xs text-kaizen-muted">Best Streak</p>
          <p className="text-2xl font-bold">{stats?.longest_streak ?? 0}</p>
        </div>
        <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-4 text-center">
          <p className="text-xs text-kaizen-muted">Balance</p>
          <p className={`text-2xl font-bold ${balance > 0 ? "text-red-400" : "text-green-400"}`}>
            {balance > 0 ? `₱${balance}` : "✓"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <h3 className="font-display text-lg text-gold">Memberships</h3>
        <div className="mt-3 space-y-2">
          {memberships.map((m) => {
            const program = m.programs as { name?: string } | null;
            return (
              <div key={m.id} className="flex justify-between text-sm">
                <span>{program?.name}</span>
                <Badge variant={m.status === "ACTIVE" ? "success" : "muted"}>{m.status}</Badge>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <h3 className="font-display text-lg text-gold">Achievements</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {(achievements ?? []).map((a) => {
            const achievement = a.achievements as { name?: string; icon?: string } | null;
            return (
              <span key={a.achievement_id} className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm">
                {achievement?.icon} {achievement?.name}
              </span>
            );
          })}
          {(achievements ?? []).length === 0 && <p className="text-sm text-kaizen-muted">Keep training to earn badges!</p>}
        </div>
      </div>

      <div className="rounded-xl border border-kaizen-red/30 bg-gradient-to-br from-kaizen-red/10 to-kaizen-black p-6 text-center">
        <p className="font-display text-sm tracking-widest text-gold">WEEKLY GOAL</p>
        <p className="mt-2 text-3xl font-bold streak-fire">{stats?.monthly_visits ?? 0} / 12</p>
        <p className="mt-1 text-sm text-kaizen-muted">sessions this month</p>
      </div>

      <TrainTodayButton
        initialCheckedIn={Boolean(todayAttendance)}
        initialCheckedOut={Boolean(todayAttendance?.checked_out_at)}
      />
    </div>
  );
}
