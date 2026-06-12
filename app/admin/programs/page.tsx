import { getPrograms } from "@/lib/cms";
import { createProgramAction } from "../cms/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPeso } from "@/lib/utils";

export default async function ProgramsAdminPage() {
  const programs = await getPrograms();

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">Programs</h2>
      <form action={createProgramAction} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 space-y-4 max-w-xl">
        <h3 className="font-display text-lg text-gold">Add Program</h3>
        <div className="space-y-1.5"><Label>Name</Label><Input name="name" required /></div>
        <div className="space-y-1.5"><Label>Description</Label><Textarea name="description" /></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>Age Min</Label><Input name="age_min" type="number" /></div>
          <div className="space-y-1.5"><Label>Age Max</Label><Input name="age_max" type="number" /></div>
          <div className="space-y-1.5"><Label>Default Price</Label><Input name="default_price" type="number" /></div>
        </div>
        <Button type="submit" variant="gold">Create Program</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {programs.map((p) => (
          <div key={p.id} className="rounded-xl border border-blue/20 bg-kaizen-dark p-5">
            <h3 className="font-display font-bold text-gold">{p.name}</h3>
            <p className="mt-2 text-sm text-kaizen-muted">{p.description}</p>
            <p className="mt-2 font-bold">{formatPeso(Number(p.default_price))}/mo</p>
          </div>
        ))}
      </div>
    </div>
  );
}
