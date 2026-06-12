import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getStudentForUser } from "@/lib/access";

export default async function StudentAttendancePage() {
  const profile = await getCurrentProfile();
  const student = await getStudentForUser(profile?.id ?? "");
  const supabase = await createClient();
  const { data } = await supabase
    ?.from("attendance")
    .select("*")
    .eq("student_id", student?.id ?? "")
    .order("date", { ascending: false })
    .limit(60) ?? { data: [] };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">My Attendance</h2>
      <div className="grid grid-cols-7 gap-1">
        {(data ?? []).slice(0, 28).map((a) => (
          <div key={a.id} className="aspect-square rounded bg-blue/30 flex items-center justify-center text-xs" title={a.date}>
            ✓
          </div>
        ))}
      </div>
      <ul className="space-y-2 text-sm">
        {(data ?? []).map((a) => (
          <li key={a.id} className="flex justify-between border-b border-blue/10 pb-2">
            <span>{a.date}</span>
            <span className="text-kaizen-muted">{a.check_in_method}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
