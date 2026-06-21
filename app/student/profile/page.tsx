import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getStudentForUser } from "@/lib/access";
import { updateStudentProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function StudentProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const student = await getStudentForUser(profile.id);
  if (!student) {
    return <p className="text-kaizen-muted">No student profile linked.</p>;
  }

  const supabase = await createClient();
  const { data: guardians } = await supabase
    ?.from("guardians")
    .select("*")
    .eq("student_id", student.id) ?? { data: [] };

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="text-center">
        <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full ring-4 ring-gold/40">
          {student.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={student.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue/20 text-3xl font-bold text-blue">
              {student.first_name.charAt(0)}
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-kaizen-muted">Photo updates — ask front desk or upload coming soon</p>
      </div>

      <form action={updateStudentProfile} className="space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <h2 className="font-display text-xl font-bold text-gold">My Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input value={`${student.first_name} ${student.last_name}`} disabled />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={student.email ?? profile.email ?? ""} disabled />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={student.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="birthday">Birthdate</Label>
          <Input id="birthday" name="birthday" type="date" defaultValue={student.birthday ?? ""} />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" defaultValue={student.address ?? ""} />
        </div>
        {(guardians ?? []).length > 0 && (
          <div className="border-t border-blue/10 pt-4">
            <p className="text-sm font-semibold text-kaizen-silver">Guardian on file</p>
            {(guardians ?? []).map((g) => (
              <p key={g.id} className="mt-1 text-sm text-kaizen-muted">
                {g.name} ({g.relationship}) — {g.phone}
              </p>
            ))}
          </div>
        )}
        <Button type="submit" variant="gold">
          Save changes
        </Button>
        <p className="text-xs text-kaizen-muted">Changes are logged and visible to admin staff.</p>
      </form>
    </div>
  );
}
