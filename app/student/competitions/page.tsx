import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getStudentForUser } from "@/lib/access";
import { formatDate } from "@/lib/utils";

export default async function StudentCompetitionsPage() {
  const profile = await getCurrentProfile();
  const student = await getStudentForUser(profile?.id ?? "");
  const supabase = await createClient();
  const { data } = await supabase
    ?.from("competitions")
    .select("*")
    .eq("student_id", student?.id ?? "")
    .order("date", { ascending: false }) ?? { data: [] };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Competition History</h2>
      {(data ?? []).length === 0 ? (
        <p className="text-kaizen-muted">No competition records yet.</p>
      ) : (
        <ul className="space-y-4">
          {(data ?? []).map((c) => (
            <li key={c.id} className="rounded-xl border border-blue/20 bg-kaizen-dark p-5">
              <div className="flex justify-between">
                <h3 className="font-bold">{c.name}</h3>
                <span className="text-sm text-kaizen-muted">{formatDate(c.date)}</span>
              </div>
              <p className="mt-2 text-sm">{c.division} · {c.result} {c.medal && `· ${c.medal}`}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
