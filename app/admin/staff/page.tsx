import { createClient } from "@/lib/supabase/server";
import { requireSuperAdminProfile } from "@/lib/permissions-server";
import { ALL_PERMISSION_FLAGS, PERMISSION_LABELS } from "@/lib/permissions";
import { createStaffAccount, deactivateStaffAccount, updateStaffPermissions } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/portals/portal-shell";

export default async function StaffPage() {
  await requireSuperAdminProfile();
  const supabase = await createClient();
  const { data: staff } = await supabase
    ?.from("profiles")
    .select("id, email, first_name, last_name, role, is_active, admin_permissions(*)")
    .in("role", ["ADMIN", "COACH"])
    .order("created_at", { ascending: false }) ?? { data: [] };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl font-bold">Create Staff Account</h2>
        <form action={createStaffAccount} className="mt-4 max-w-2xl space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>First name</Label>
              <Input name="first_name" required />
            </div>
            <div>
              <Label>Last name</Label>
              <Input name="last_name" required />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" required />
          </div>
          <div>
            <Label>Temporary password</Label>
            <Input name="password" type="password" required minLength={6} />
          </div>
          <div>
            <Label>Role</Label>
            <select name="role" className="mt-1 w-full rounded-md border border-blue/30 bg-kaizen-black px-3 py-2">
              <option value="COACH">Coach</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-gold">Permissions</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="perm_full_admin_access" />
              Full admin access (all permissions)
            </label>
            {ALL_PERMISSION_FLAGS.filter((f) => f !== "manage_staff").map((flag) => (
              <label key={flag} className="flex items-center gap-2 text-sm text-kaizen-muted">
                <input type="checkbox" name={`perm_${flag}`} />
                {PERMISSION_LABELS[flag]}
              </label>
            ))}
          </fieldset>
          <Button type="submit" variant="gold">
            Create account
          </Button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold">Staff Accounts</h2>
        <div className="mt-4 space-y-4">
          {(staff ?? []).map((member) => {
            const perms = Array.isArray(member.admin_permissions)
              ? member.admin_permissions[0]
              : member.admin_permissions;
            return (
              <div key={member.id} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-lg">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-kaizen-muted">{member.email}</p>
                    <p className="mt-1 text-xs uppercase text-gold">{member.role}</p>
                  </div>
                  <StatusBadge status={member.is_active ? "ACTIVE" : "INACTIVE"} />
                </div>
                {perms && (
                  <form action={updateStaffPermissions.bind(null, member.id)} className="mt-4 space-y-2 border-t border-blue/10 pt-4">
                    <p className="text-sm font-semibold text-kaizen-silver">Edit permissions</p>
                    {ALL_PERMISSION_FLAGS.filter((f) => f !== "manage_staff").map((flag) => (
                      <label key={flag} className="flex items-center gap-2 text-sm text-kaizen-muted">
                        <input
                          type="checkbox"
                          name={`perm_${flag}`}
                          defaultChecked={Boolean((perms as Record<string, boolean>)[flag])}
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
                  <form action={deactivateStaffAccount.bind(null, member.id)} className="mt-3">
                    <Button type="submit" size="sm" variant="ghost" className="text-red-400">
                      Deactivate account
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
