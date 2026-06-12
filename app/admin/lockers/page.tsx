import { createClient } from "@/lib/supabase/server";
import { createLockerAction, assignLockerAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatPeso } from "@/lib/utils";

export default async function LockersPage() {
  const supabase = await createClient();
  const [{ data: lockers }, { data: students }] = await Promise.all([
    supabase?.from("lockers").select("*, locker_rentals(student_id, students(first_name, last_name))").order("number") ?? { data: [] },
    supabase?.from("students").select("id, first_name, last_name").eq("status", "ACTIVE") ?? { data: [] },
  ]);

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">Locker Management</h2>
      <div className="grid gap-8 lg:grid-cols-2">
        <form action={createLockerAction} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-4">
          <h3 className="font-display text-lg text-gold">Add Locker</h3>
          <div className="space-y-1.5"><Label>Locker Number</Label><Input name="number" required /></div>
          <div className="space-y-1.5"><Label>Monthly Fee</Label><Input name="monthly_fee" type="number" defaultValue={500} /></div>
          <Button type="submit" variant="gold">Create Locker</Button>
        </form>
        <form action={assignLockerAction} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-4">
          <h3 className="font-display text-lg text-gold">Assign Locker</h3>
          <div className="space-y-1.5">
            <Label>Locker</Label>
            <select name="locker_id" required className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm">
              {(lockers ?? []).filter((l) => l.status === "AVAILABLE").map((l) => (
                <option key={l.id} value={l.id}>#{l.number}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Student</Label>
            <select name="student_id" required className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm">
              {(students ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="secondary">Assign</Button>
        </form>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(lockers ?? []).map((l) => {
          const rental = Array.isArray(l.locker_rentals) ? l.locker_rentals[0] : l.locker_rentals;
          const student = rental?.students as { first_name?: string; last_name?: string } | null;
          return (
            <div key={l.id} className="rounded-xl border border-blue/20 bg-kaizen-dark p-4">
              <div className="flex justify-between items-start">
                <span className="font-display text-xl font-bold">#{l.number}</span>
                <Badge variant={l.status === "AVAILABLE" ? "success" : l.status === "OCCUPIED" ? "default" : "muted"}>{l.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-kaizen-muted">{formatPeso(Number(l.monthly_fee))}/mo</p>
              {student && <p className="mt-1 text-sm">{student.first_name} {student.last_name}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
