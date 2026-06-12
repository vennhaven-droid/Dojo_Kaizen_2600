import { createClient } from "@/lib/supabase/server";
import { createCompetitionAction } from "../cms/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

export default async function CompetitionsPage() {
  const supabase = await createClient();
  const [{ data: competitions }, { data: students }] = await Promise.all([
    supabase?.from("competitions").select("*, students(first_name, last_name)").order("date", { ascending: false }) ?? { data: [] },
    supabase?.from("students").select("id, first_name, last_name").eq("status", "ACTIVE") ?? { data: [] },
  ]);

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">Competitions</h2>
      <form action={createCompetitionAction} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-4 max-w-xl">
        <h3 className="font-display text-lg text-gold">Add Competition Record</h3>
        <div className="space-y-1.5">
          <Label>Student</Label>
          <select name="student_id" required className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm">
            {(students ?? []).map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5"><Label>Competition Name</Label><Input name="name" required /></div>
        <div className="space-y-1.5"><Label>Date</Label><Input name="date" type="date" required /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Division</Label><Input name="division" /></div>
          <div className="space-y-1.5"><Label>Result</Label><Input name="result" placeholder="Win/Loss/Draw" /></div>
          <div className="space-y-1.5"><Label>Placement</Label><Input name="placement" /></div>
          <div className="space-y-1.5"><Label>Medal</Label><Input name="medal" placeholder="Gold/Silver/Bronze" /></div>
        </div>
        <Button type="submit" variant="gold">Save Record</Button>
      </form>
      <div className="space-y-4">
        {(competitions ?? []).map((c) => {
          const student = c.students as { first_name?: string; last_name?: string } | null;
          return (
            <div key={c.id} className="rounded-xl border border-blue/20 bg-kaizen-dark p-5">
              <div className="flex justify-between">
                <h3 className="font-bold">{c.name}</h3>
                <span className="text-sm text-kaizen-muted">{formatDate(c.date)}</span>
              </div>
              <p className="text-sm mt-1">{student?.first_name} {student?.last_name} · {c.division} · {c.result} {c.medal && `· ${c.medal}`}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
