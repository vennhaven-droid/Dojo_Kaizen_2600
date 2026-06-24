import Link from "next/link";
import { getAllCoaches, coachDisplayName } from "@/lib/cms";
import { createMarketingCoachAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function CoachesAdminPage() {
  const coaches = await getAllCoaches();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Coaches</h2>
          <p className="text-sm text-kaizen-muted">
            Marketing profiles appear on /coaches. Link login accounts via Users when needed.
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/users?role=coach">+ Create coach with login</Link>
        </Button>
      </div>

      <form action={createMarketingCoachAction} className="max-w-xl space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <h3 className="font-display text-lg text-gold">Add coach profile</h3>
        <p className="text-sm text-kaizen-muted">No login account — for website display only.</p>
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input name="display_name" required placeholder="Coach name" />
        </div>
        <div className="space-y-1.5">
          <Label>Bio</Label>
          <Textarea name="bio" rows={2} placeholder="Short bio for the website" />
        </div>
        <div className="space-y-1.5">
          <Label>Photo (optional)</Label>
          <Input name="file" type="file" accept="image/*" />
        </div>
        <Button type="submit" variant="outline">Add coach profile</Button>
      </form>

      {coaches.length === 0 ? (
        <p className="text-kaizen-muted">
          No coaches yet. Add a profile above or run &quot;Import website photos &amp; coaches&quot; on the Media page.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-blue/20 bg-kaizen-dark">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coaches.map((c) => {
                const profile = c.profiles as { email?: string } | null;
                const hasLogin = Boolean(c.profile_id);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold">{coachDisplayName(c)}</TableCell>
                    <TableCell className="text-sm text-kaizen-muted">
                      {hasLogin ? (profile?.email ?? "Linked account") : "Marketing only"}
                    </TableCell>
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
