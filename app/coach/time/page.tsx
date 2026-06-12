import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { coachTimeIn, coachTimeOut } from "../actions";
import { Button } from "@/components/ui/button";

export default async function CoachTimePage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data: coach } = await supabase?.from("coaches").select("id").eq("profile_id", profile?.id ?? "").single() ?? { data: null };

  const { data: logs } = await supabase
    ?.from("coach_time_logs")
    .select("*")
    .eq("coach_id", coach?.id ?? "")
    .order("time_in", { ascending: false })
    .limit(20) ?? { data: [] };

  const openLog = logs?.find((l) => !l.time_out);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Time Log</h2>
      {openLog ? (
        <form action={async () => { "use server"; await coachTimeOut(openLog.id); }}>
          <Button type="submit" variant="destructive">Clock Out</Button>
        </form>
      ) : (
        <form action={coachTimeIn}>
          <Button type="submit" variant="gold">Clock In</Button>
        </form>
      )}
      <ul className="space-y-2 text-sm">
        {(logs ?? []).map((l) => (
          <li key={l.id} className="rounded-lg border border-blue/20 p-3">
            {new Date(l.time_in).toLocaleString()} — {l.time_out ? new Date(l.time_out).toLocaleString() : "Active"}
          </li>
        ))}
      </ul>
    </div>
  );
}
