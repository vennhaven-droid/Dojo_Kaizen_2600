import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProgramAction } from "../../cms/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: program } = await supabase?.from("programs").select("*").eq("id", id).single() ?? { data: null };
  if (!program) notFound();

  async function save(formData: FormData) {
    "use server";
    await updateProgramAction(id, formData);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/admin/programs" className="text-sm text-blue hover:underline">← Programs</Link>
      <h2 className="font-display text-2xl font-bold">Edit {program.name}</h2>
      <form action={save} className="space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <div className="space-y-1.5"><Label>Name</Label><Input name="name" defaultValue={program.name} required /></div>
        <div className="space-y-1.5"><Label>Description</Label><Textarea name="description" defaultValue={program.description ?? ""} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Age Min</Label><Input name="age_min" type="number" defaultValue={program.age_min ?? ""} /></div>
          <div className="space-y-1.5"><Label>Age Max</Label><Input name="age_max" type="number" defaultValue={program.age_max ?? ""} /></div>
        </div>
        <div className="space-y-1.5"><Label>Sort Order</Label><Input name="sort_order" type="number" defaultValue={program.sort_order ?? 0} /></div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={program.is_active} />
          Active on website
        </label>
        <Button type="submit" variant="gold">Save changes</Button>
      </form>
    </div>
  );
}
