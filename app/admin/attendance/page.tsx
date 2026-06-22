import { createClient } from "@/lib/supabase/server";
import { adminCheckInAction, adminCheckOutAction } from "../actions";
import { ManualAttendanceForm } from "@/components/admin/manual-attendance-form";
import { Button } from "@/components/ui/button";
import { todayISO } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

async function checkInStudentAction(formData: FormData) {
  "use server";
  const date = String(formData.get("date") || "") || undefined;
  await adminCheckInAction(String(formData.get("student_id")), date);
}

async function checkOutStudentAction(formData: FormData) {
  "use server";
  await adminCheckOutAction(String(formData.get("student_id")));
}

export default async function AttendancePage() {
  const supabase = await createClient();
  const today = todayISO();

  const [{ data: todayAttendance }, { data: students }] = await Promise.all([
    supabase?.from("attendance").select("*, students(id, first_name, last_name)").eq("date", today).order("checked_in_at", { ascending: false }) ?? { data: [] },
    supabase?.from("students").select("id, first_name, last_name").eq("status", "ACTIVE").order("last_name") ?? { data: [] },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-bold">Attendance — {today}</h2>
        <p className="text-gold font-bold">{todayAttendance?.length ?? 0} check-ins today</p>
      </div>

      <ManualAttendanceForm
        students={students ?? []}
        defaultDate={today}
        checkInAction={checkInStudentAction}
      />

      <div className="rounded-xl border border-blue/20 bg-kaizen-dark">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Method</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(todayAttendance ?? []).map((a) => {
              const student = a.students as { first_name?: string; last_name?: string; id?: string } | null;
              return (
                <TableRow key={a.id}>
                  <TableCell>{student?.first_name} {student?.last_name}</TableCell>
                  <TableCell>{new Date(a.checked_in_at).toLocaleTimeString()}</TableCell>
                  <TableCell>{a.checked_out_at ? new Date(a.checked_out_at).toLocaleTimeString() : "—"}</TableCell>
                  <TableCell>{a.duration_minutes ? `${a.duration_minutes} min` : "—"}</TableCell>
                  <TableCell>{a.check_in_method}</TableCell>
                  <TableCell>
                    {!a.checked_out_at && student?.id && (
                      <form action={checkOutStudentAction}>
                        <input type="hidden" name="student_id" value={student.id} />
                        <Button type="submit" variant="outline" size="sm">Check out</Button>
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
