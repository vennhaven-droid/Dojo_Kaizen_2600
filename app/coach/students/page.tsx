import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { createStudentNote } from "../actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function CoachStudentsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data: students } = await supabase?.from("students").select("id, first_name, last_name").eq("status", "ACTIVE").order("last_name") ?? { data: [] };

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="font-display text-2xl font-bold">Student Notes</h2>
      <form action={createStudentNote} className="space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <div className="space-y-1.5">
          <Label>Student</Label>
          <select name="student_id" required className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm">
            {(students ?? []).map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <select name="category" className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm">
            <option value="progress">Progress</option>
            <option value="competition">Competition Readiness</option>
            <option value="attendance">Attendance Concerns</option>
            <option value="improvement">Improvement Areas</option>
          </select>
        </div>
        <div className="space-y-1.5"><Label>Note</Label><Textarea name="note" required rows={4} /></div>
        <Button type="submit" variant="gold">Save Note</Button>
      </form>
    </div>
  );
}
