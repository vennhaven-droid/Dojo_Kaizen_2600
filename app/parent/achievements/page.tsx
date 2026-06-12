import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getParentStudentIds } from "@/lib/access";

export default async function ParentAchievementsPage() {
  const profile = await getCurrentProfile();
  const studentIds = await getParentStudentIds(profile?.id ?? "");
  const supabase = await createClient();
  const { data } = await supabase
    ?.from("student_achievements")
    .select("*, achievements(name, icon), students(first_name, last_name)")
    .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"]) ?? { data: [] };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Achievements</h2>
      <div className="flex flex-wrap gap-3">
        {(data ?? []).map((a) => {
          const achievement = a.achievements as { name?: string; icon?: string } | null;
          const student = a.students as { first_name?: string; last_name?: string } | null;
          return (
            <span key={`${a.student_id}-${a.achievement_id}`} className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm">
              {achievement?.icon} {achievement?.name} — {student?.first_name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
