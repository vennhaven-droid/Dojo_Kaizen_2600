import { createClient } from "@/lib/supabase/server";
import { requireSuperAdminProfile } from "@/lib/permissions-server";
import { ALL_PERMISSION_FLAGS, PERMISSION_LABELS } from "@/lib/permissions";
import { deactivateUserAccount, updateStaffPermissions } from "./actions";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/portals/portal-shell";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  await requireSuperAdminProfile();
  const { role } = await searchParams;
  const supabase = await createClient();

  const [{ data: profiles }, { data: programs }, { data: students }] = await Promise.all([
    supabase
      ?.from("profiles")
      .select("id, email, first_name, last_name, role, is_active, admin_permissions(*)")
      .in("role", ["ADMIN", "COACH", "STUDENT", "PARENT"])
      .order("created_at", { ascending: false }) ?? { data: [] },
    supabase?.from("programs").select("id, name").eq("is_active", true).order("name") ?? { data: [] },
    supabase?.from("students").select("id, first_name, last_name").eq("status", "ACTIVE").order("last_name") ?? { data: [] },
  ]);

  const staffProfiles = (profiles ?? []).filter((p) => p.role === "ADMIN" || p.role === "COACH");

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-2xl font-bold">Users</h2>
        <p className="mt-1 text-sm text-kaizen-muted">
          Create student, parent, coach, or admin accounts in one place.
        </p>
      </div>

      <CreateUserForm
        defaultRole={role}
        programs={programs ?? []}
        students={students ?? []}
      />

      <section>
        <h3 className="font-display text-xl font-bold">Staff &amp; coaches</h3>
        <div className="mt-4 space-y-4">
          {staffProfiles.map((member) => {
            const perms = Array.isArray(member.admin_permissions)
              ? member.admin_permissions[0]
              : member.admin_permissions;
            return (
              <div key={member.id} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-kaizen-muted">{member.email}</p>
                    <p className="mt-1 text-xs uppercase text-gold">{member.role}</p>
                  </div>
                  <StatusBadge status={member.is_active ? "ACTIVE" : "INACTIVE"} />
                </div>
                {perms && (
                  <form action={updateStaffPermissions.bind(null, member.id)} className="mt-4 space-y-2 border-t border-blue/10 pt-4">
                    <p className="text-sm font-semibold text-kaizen-silver">Permissions</p>
                    {ALL_PERMISSION_FLAGS.filter((f) => f !== "manage_staff").map((flag) => (
                      <label key={flag} className="flex items-center gap-2 text-sm text-kaizen-muted">
                        <input
                          type="checkbox"
                          name={`perm_${flag}`}
                          defaultChecked={Boolean(perms[flag as keyof typeof perms])}
                        />
                        {PERMISSION_LABELS[flag]}
                      </label>
                    ))}
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="perm_full_admin_access" defaultChecked={perms.full_admin_access} />
                      Full admin access
                    </label>
                    <Button type="submit" size="sm" variant="outline">
                      Save permissions
                    </Button>
                  </form>
                )}
                {member.is_active && (
                  <form action={deactivateUserAccount.bind(null, member.id)} className="mt-3">
                    <Button type="submit" size="sm" variant="ghost" className="text-red-400">
                      Deactivate
                    </Button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
