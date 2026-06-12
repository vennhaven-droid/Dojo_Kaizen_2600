import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getParentStudentIds } from "@/lib/access";

export default async function ParentAttendancePage() {
  const profile = await getCurrentProfile();
  const studentIds = await getParentStudentIds(profile?.id ?? "");
  const supabase = await createClient();
  const { data } = await supabase
    ?.from("attendance")
    .select("*, students(first_name, last_name)")
    .in("student_id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"])
    .order("date", { ascending: false })
    .limit(50) ?? { data: [] };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Attendance History</h2>
      <ul className="space-y-2 text-sm">
        {(data ?? []).map((a) => {
          const s = a.students as { first_name?: string; last_name?: string } | null;
          return (
            <li key={a.id} className="flex justify-between rounded-lg border border-blue/20 p-3">
              <span>{s?.first_name} {s?.last_name}</span>
              <span className="text-kaizen-muted">{a.date}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
