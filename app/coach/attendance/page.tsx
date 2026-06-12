import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/server";

export default async function CoachAttendancePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    ?.from("attendance")
    .select("*, students(first_name, last_name)")
    .eq("date", today)
    .order("checked_in_at", { ascending: false }) ?? { data: [] };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Today&apos;s Attendance</h2>
      <ul className="space-y-2 text-sm">
        {(data ?? []).map((a) => {
          const s = a.students as { first_name?: string; last_name?: string } | null;
          return (
            <li key={a.id} className="flex justify-between rounded-lg border border-blue/20 p-3">
              <span>{s?.first_name} {s?.last_name}</span>
              <span className="text-kaizen-muted">{new Date(a.checked_in_at).toLocaleTimeString()}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
