import Link from "next/link";
import { getPrograms } from "@/lib/cms";
import { createProgramAction } from "../cms/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default async function ProgramsAdminPage() {
  const programs = await getPrograms();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Programs</h2>
          <p className="text-sm text-kaizen-muted">Program info only — set prices under Pricing.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/pricing">Manage pricing →</Link>
        </Button>
      </div>
      <form action={createProgramAction} className="max-w-xl space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <h3 className="font-display text-lg text-gold">Add Program</h3>
        <div className="space-y-1.5"><Label>Name</Label><Input name="name" required /></div>
        <div className="space-y-1.5"><Label>Description</Label><Textarea name="description" /></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>Age Min</Label><Input name="age_min" type="number" /></div>
          <div className="space-y-1.5"><Label>Age Max</Label><Input name="age_max" type="number" /></div>
          <div className="space-y-1.5"><Label>Sort Order</Label><Input name="sort_order" type="number" defaultValue={0} /></div>
        </div>
        <Button type="submit" variant="gold">Create Program</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {programs.map((p) => (
          <div key={p.id} className="rounded-xl border border-blue/20 bg-kaizen-dark p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-bold text-gold">{p.name}</h3>
              <Badge variant={p.is_active ? "success" : "muted"}>{p.is_active ? "Active" : "Inactive"}</Badge>
            </div>
            <p className="mt-2 text-sm text-kaizen-muted">{p.description}</p>
            {(p.age_min || p.age_max) && (
              <p className="mt-2 text-xs text-kaizen-muted">Ages {p.age_min ?? "?"}–{p.age_max ?? "?"}</p>
            )}
            <Link href={`/admin/programs/${p.id}`} className="mt-4 inline-block text-sm text-blue hover:underline">
              Edit program →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
