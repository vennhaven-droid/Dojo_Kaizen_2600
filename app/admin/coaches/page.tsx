import { getCoaches } from "@/lib/cms";

export default async function CoachesAdminPage() {
  const coaches = await getCoaches();

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Coaches</h2>
      {coaches.length === 0 ? (
        <p className="text-kaizen-muted">No coaches yet. Create a user with COACH role and link their profile.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {coaches.map((c) => {
            const profile = c.profiles as { first_name?: string; last_name?: string; email?: string } | null;
            return (
              <div key={c.id} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
                <h3 className="font-display font-bold text-gold">
                  {profile?.first_name} {profile?.last_name}
                </h3>
                <p className="text-sm text-kaizen-muted mt-1">{profile?.email}</p>
                <p className="mt-3 text-sm">{c.bio ?? c.experience ?? "No bio yet"}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
