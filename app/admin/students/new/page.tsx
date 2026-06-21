import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createStudent } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { redirect } from "next/navigation";

export default async function NewStudentPage() {
  const supabase = await createClient();
  const { data: programs } = await supabase?.from("programs").select("id, name").eq("is_active", true).order("name") ?? { data: [] };

  async function action(formData: FormData) {
    "use server";
    const result = await createStudent(formData);
    redirect(`/admin/students/${result.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/students" className="text-sm text-blue hover:underline">← Back</Link>
        <h2 className="font-display text-2xl font-bold">New Student</h2>
      </div>
      <form action={action} className="space-y-8 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <section className="space-y-4">
          <h3 className="font-display text-lg text-gold">Portal Login (optional)</h3>
          <p className="text-sm text-kaizen-muted">Create a student login so they can check in and view their dashboard.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Login Email</Label><Input name="login_email" type="email" /></div>
            <div className="space-y-1.5"><Label>Login Password</Label><Input name="login_password" type="password" minLength={8} /></div>
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="font-display text-lg text-gold">Profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>First Name *</Label><Input name="first_name" required /></div>
            <div className="space-y-1.5"><Label>Last Name *</Label><Input name="last_name" required /></div>
            <div className="space-y-1.5"><Label>Nickname</Label><Input name="nickname" /></div>
            <div className="space-y-1.5"><Label>Birthday</Label><Input name="birthday" type="date" /></div>
            <div className="space-y-1.5"><Label>Gender</Label><Input name="gender" /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input name="phone" type="tel" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Email</Label><Input name="email" type="email" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Address</Label><Input name="address" /></div>
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="font-display text-lg text-gold">Membership</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Program</Label>
              <select name="program_id" className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm">
                <option value="">None yet</option>
                {(programs ?? []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <select name="membership_type" className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm">
                <option value="MONTHLY">Monthly</option>
                <option value="WALK_IN">Walk-in</option>
                <option value="SESSION_PACKAGE">Session Package</option>
                <option value="PRIVATE_COACHING">Private Coaching</option>
              </select>
            </div>
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="font-display text-lg text-gold">Guardian 1</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Name</Label><Input name="guardian1_name" /></div>
            <div className="space-y-1.5"><Label>Relationship</Label><Input name="guardian1_relationship" defaultValue="Parent" /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input name="guardian1_phone" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input name="guardian1_email" type="email" /></div>
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="font-display text-lg text-gold">Parent Portal Account (optional)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Parent Email</Label><Input name="parent_email" type="email" /></div>
            <div className="space-y-1.5"><Label>Parent Password</Label><Input name="parent_password" type="password" minLength={8} /></div>
            <div className="space-y-1.5"><Label>Parent First Name</Label><Input name="parent_first_name" /></div>
            <div className="space-y-1.5"><Label>Parent Last Name</Label><Input name="parent_last_name" /></div>
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="font-display text-lg text-gold">Emergency Contact</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5"><Label>Name</Label><Input name="emergency_name" /></div>
            <div className="space-y-1.5"><Label>Relationship</Label><Input name="emergency_relationship" /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input name="emergency_phone" /></div>
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="font-display text-lg text-gold">Medical & Notes</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Allergies</Label><Input name="allergies" /></div>
            <div className="space-y-1.5"><Label>Conditions</Label><Input name="conditions" /></div>
            <div className="space-y-1.5"><Label>Injuries</Label><Input name="injuries" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Admin Notes</Label><Textarea name="notes" rows={2} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Medical Notes</Label><Textarea name="medical_notes" /></div>
          </div>
        </section>
        <Button type="submit" variant="gold">Create Student</Button>
      </form>
    </div>
  );
}
