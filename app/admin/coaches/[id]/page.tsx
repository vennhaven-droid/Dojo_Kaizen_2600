import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { coachDisplayName } from "@/lib/cms";
import { updateCoachAction, updateCoachPhotoAction } from "../../cms/actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function EditCoachPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: coach } = await supabase
    ?.from("coaches")
    .select("*, profiles(first_name, last_name, email, avatar_url)")
    .eq("id", id)
    .single() ?? { data: null };

  if (!coach) notFound();

  const profile = coach.profiles as { first_name?: string; last_name?: string; email?: string; avatar_url?: string } | null;
  const photoUrl = coach.photo_url ?? profile?.avatar_url;
  const isMarketingOnly = !coach.profile_id;

  async function save(formData: FormData) {
    "use server";
    await updateCoachAction(id, formData);
  }

  async function uploadPhoto(formData: FormData) {
    "use server";
    await updateCoachPhotoAction(id, formData);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/admin/coaches" className="text-sm text-blue hover:underline">← Coaches</Link>
      <h2 className="font-display text-2xl font-bold">{coachDisplayName(coach)}</h2>
      {profile?.email && <p className="text-sm text-kaizen-muted">{profile.email}</p>}
      {isMarketingOnly && (
        <p className="text-sm text-kaizen-muted">Marketing profile — no login account linked.</p>
      )}

      <ImageUploadField label="Coach photo" defaultUrl={photoUrl} action={uploadPhoto} shape="circle" />

      <form action={save} className="space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <input type="hidden" name="photo_url" value={photoUrl ?? ""} />
        {isMarketingOnly && (
          <div className="space-y-1.5">
            <Label>Display name</Label>
            <Input name="display_name" defaultValue={coach.display_name ?? ""} required />
          </div>
        )}
        <div className="space-y-1.5"><Label>Bio</Label><Textarea name="bio" rows={4} defaultValue={coach.bio ?? ""} /></div>
        <div className="space-y-1.5"><Label>Experience</Label><Textarea name="experience" rows={3} defaultValue={coach.experience ?? ""} /></div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={coach.is_active} />
          Active on website
        </label>
        <Button type="submit" variant="gold">Save coach</Button>
      </form>
    </div>
  );
}
