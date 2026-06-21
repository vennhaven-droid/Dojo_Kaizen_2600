import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateAge } from "@/lib/utils";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createClient();
  let query = supabase?.from("students").select("*, student_stats(total_visits, last_visit), memberships(type, status, programs(name))").order("last_name");

  if (status && status !== "ALL") {
    query = query?.eq("status", status);
  }
  if (q) {
    query = query?.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: students } = (await query) ?? { data: [] };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Students</h2>
        <Button asChild variant="gold"><Link href="/admin/students/new">Add Student</Link></Button>
      </div>

      <form className="flex flex-wrap gap-3">
        <Input name="q" defaultValue={q ?? ""} placeholder="Search name or email…" className="max-w-xs" />
        <select
          name="status"
          defaultValue={status ?? "ALL"}
          className="h-11 rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_HOLD">On Hold</option>
        </select>
        <Button type="submit" variant="secondary" size="sm">Filter</Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-blue/20 bg-kaizen-dark">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visits</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(students ?? []).map((s) => {
              const stats = s.student_stats as { total_visits?: number; last_visit?: string } | null;
              const memberships = s.memberships as Array<{ programs?: { name?: string } }> | null;
              const programNames = (memberships ?? []).map((m) => m.programs?.name).filter(Boolean).join(", ");
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold">
                    {s.first_name} {s.last_name}
                    {s.nickname && <span className="text-kaizen-muted"> ({s.nickname})</span>}
                  </TableCell>
                  <TableCell>{calculateAge(s.birthday) ?? "—"}</TableCell>
                  <TableCell className="text-sm text-kaizen-muted">{programNames || "—"}</TableCell>
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
