import { createClient } from "@/lib/supabase/server";
import {
  createLockerAction,
  bulkCreateLockersAction,
  assignLockerAction,
  releaseLockerAction,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatPeso } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function LockersPage() {
  const supabase = await createClient();
  const [{ data: lockers }, { data: students }] = await Promise.all([
    supabase
      ?.from("lockers")
      .select("*, locker_rentals(student_id, renewal_date, students(first_name, last_name))")
      .order("number") ?? { data: [] },
    supabase?.from("students").select("id, first_name, last_name").eq("status", "ACTIVE").order("last_name") ?? { data: [] },
  ]);

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">Locker Management</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        <form action={createLockerAction} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-4">
          <h3 className="font-display text-lg text-gold">Add Locker</h3>
          <div className="space-y-1.5"><Label>Number</Label><Input name="number" required /></div>
          <div className="space-y-1.5"><Label>Monthly Fee</Label><Input name="monthly_fee" type="number" defaultValue={500} /></div>
          <Button type="submit" variant="gold">Create</Button>
        </form>

        <form action={bulkCreateLockersAction} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-4">
          <h3 className="font-display text-lg text-gold">Bulk Add</h3>
          <div className="space-y-1.5"><Label>Start number</Label><Input name="start_number" type="number" defaultValue={1} /></div>
          <div className="space-y-1.5"><Label>Count</Label><Input name="count" type="number" defaultValue={30} /></div>
          <div className="space-y-1.5"><Label>Monthly fee</Label><Input name="monthly_fee" type="number" defaultValue={500} /></div>
          <Button type="submit" variant="secondary">Create batch</Button>
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

      <div className="overflow-x-auto rounded-xl border border-blue/20 bg-kaizen-dark">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Monthly Fee</TableHead>
              <TableHead>Renewal</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(lockers ?? []).map((l) => {
              const rental = Array.isArray(l.locker_rentals) ? l.locker_rentals[0] : l.locker_rentals;
              const student = rental?.students as { first_name?: string; last_name?: string } | null;
              return (
                <TableRow key={l.id}>
                  <TableCell className="font-bold">#{l.number}</TableCell>
                  <TableCell>
                    <Badge variant={l.status === "AVAILABLE" ? "success" : "default"}>{l.status}</Badge>
                  </TableCell>
                  <TableCell>{student ? `${student.first_name} ${student.last_name}` : "—"}</TableCell>
                  <TableCell>{formatPeso(Number(l.monthly_fee))}</TableCell>
                  <TableCell>{rental?.renewal_date ?? "—"}</TableCell>
                  <TableCell>
                    {l.status === "OCCUPIED" && (
                      <form action={releaseLockerAction.bind(null, l.id)}>
                        <Button type="submit" size="sm" variant="outline">Release</Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
