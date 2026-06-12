import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getStudentForUser } from "@/lib/access";

export default async function StudentAchievementsPage() {
  const profile = await getCurrentProfile();
  const student = await getStudentForUser(profile?.id ?? "");
  const supabase = await createClient();
  const { data: earned } = await supabase
    ?.from("student_achievements")
    .select("achievement_id, achievements(*)")
    .eq("student_id", student?.id ?? "") ?? { data: [] };

  const { data: all } = await supabase?.from("achievements").select("*").order("threshold") ?? { data: [] };
  const earnedIds = new Set((earned ?? []).map((e) => e.achievement_id));

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Achievements</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(all ?? []).map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border p-4 text-center ${earnedIds.has(a.id) ? "border-gold/50 bg-gold/10" : "border-blue/10 opacity-50"}`}
          >
            <span className="text-3xl">{a.icon}</span>
            <p className="mt-2 font-semibold">{a.name}</p>
            <p className="text-xs text-kaizen-muted">{a.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
