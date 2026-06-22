import Link from "next/link";
import { getCoaches } from "@/lib/cms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function CoachesAdminPage() {
  const coaches = await getCoaches();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Coaches</h2>
          <p className="text-sm text-kaizen-muted">Create coaches under Users, then edit bios and photos here.</p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/users?role=coach">+ Create coach</Link>
        </Button>
      </div>

      {coaches.length === 0 ? (
        <p className="text-kaizen-muted">No coaches yet. Create a user with the Coach role.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-blue/20 bg-kaizen-dark">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coaches.map((c) => {
                const profile = c.profiles as { first_name?: string; last_name?: string; email?: string } | null;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold">
                      {profile?.first_name} {profile?.last_name}
                    </TableCell>
                    <TableCell>{profile?.email ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? "success" : "muted"}>
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/coaches/${c.id}`} className="text-sm text-blue hover:underline">
                        Edit
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
