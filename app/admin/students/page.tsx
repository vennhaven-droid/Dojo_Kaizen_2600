import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateAge, getAgeGroup } from "@/lib/utils";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    ?.from("students")
    .select("*, student_stats(total_visits, last_visit)")
    .order("last_name") ?? { data: [] };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Students</h2>
        <Button asChild variant="gold"><Link href="/admin/students/new">Add Student</Link></Button>
      </div>
      <div className="rounded-xl border border-blue/20 bg-kaizen-dark">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age Group</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visits</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(students ?? []).map((s) => {
              const stats = s.student_stats as { total_visits?: number; last_visit?: string } | null;
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold">
                    {s.first_name} {s.last_name}
                    {s.nickname && <span className="text-kaizen-muted"> ({s.nickname})</span>}
                  </TableCell>
                  <TableCell className="capitalize">{getAgeGroup(s.birthday)}</TableCell>
                  <TableCell><Badge variant={s.status === "ACTIVE" ? "success" : "muted"}>{s.status}</Badge></TableCell>
                  <TableCell>{stats?.total_visits ?? 0}</TableCell>
                  <TableCell>{stats?.last_visit ?? "—"}</TableCell>
                  <TableCell>
                    <Link href={`/admin/students/${s.id}`} className="text-blue hover:underline text-sm">View</Link>
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
