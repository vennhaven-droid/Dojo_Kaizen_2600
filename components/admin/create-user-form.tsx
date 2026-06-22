"use client";

import { useState } from "react";
import { ALL_PERMISSION_FLAGS, PERMISSION_LABELS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createUserAccount } from "@/app/admin/users/actions";

type AccountType = "STUDENT" | "PARENT" | "COACH" | "ADMIN";

type Program = { id: string; name: string };
type Student = { id: string; first_name: string; last_name: string };

export function CreateUserForm({
  defaultRole,
  programs,
  students,
}: {
  defaultRole?: string;
  programs: Program[];
  students: Student[];
}) {
  const initial: AccountType =
    defaultRole === "coach"
      ? "COACH"
      : defaultRole === "admin"
        ? "ADMIN"
        : defaultRole === "parent"
          ? "PARENT"
          : "STUDENT";

  const [accountType, setAccountType] = useState<AccountType>(initial);
  const isStaff = accountType === "COACH" || accountType === "ADMIN";

  return (
    <form action={createUserAccount} className="max-w-2xl space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
      <input type="hidden" name="account_type" value={accountType} />
      <h3 className="font-display text-lg text-gold">Create User</h3>
      <p className="text-sm text-kaizen-muted">
        Coaches with permissions can access the admin dashboard as staff.
      </p>

      <div>
        <Label>Account type</Label>
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as AccountType)}
          className="mt-1 w-full rounded-md border border-blue/30 bg-kaizen-black px-3 py-2"
        >
          <option value="STUDENT">Student</option>
          <option value="PARENT">Parent</option>
          <option value="COACH">Coach (staff)</option>
          <option value="ADMIN">Admin (staff)</option>
        </select>
      </div>

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

      {accountType === "STUDENT" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Login email (optional)</Label>
              <Input name="login_email" type="email" />
            </div>
            <div>
              <Label>Login password</Label>
              <Input name="login_password" type="password" minLength={8} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Phone</Label>
              <Input name="phone" />
            </div>
            <div>
              <Label>Birthday</Label>
              <Input name="birthday" type="date" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Program</Label>
              <select name="program_id" className="w-full rounded-md border border-blue/30 bg-kaizen-black px-3 py-2">
                <option value="">None</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Membership type</Label>
              <select name="membership_type" className="w-full rounded-md border border-blue/30 bg-kaizen-black px-3 py-2">
                <option value="MONTHLY">Monthly</option>
                <option value="WALK_IN">Walk-in</option>
                <option value="SESSION_PACKAGE">Session package</option>
                <option value="PRIVATE_COACHING">Private coaching</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Parent email (optional)</Label>
              <Input name="parent_email" type="email" />
            </div>
            <div>
              <Label>Parent password</Label>
              <Input name="parent_password" type="password" minLength={8} />
            </div>
          </div>
        </>
      )}

      {accountType === "PARENT" && (
        <div>
          <Label>Link to student</Label>
          <select name="student_id" className="w-full rounded-md border border-blue/30 bg-kaizen-black px-3 py-2">
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {accountType === "COACH" && (
        <div>
          <Label>Bio (optional)</Label>
          <Textarea name="bio" rows={2} />
        </div>
      )}

      {(isStaff || accountType === "PARENT") && (
        <>
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" required />
          </div>
          <div>
            <Label>Temporary password</Label>
            <Input name="password" type="password" required minLength={8} />
          </div>
        </>
      )}

      {isStaff && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-gold">Admin permissions</legend>
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
      )}

      <Button type="submit" variant="gold">
        Create {accountType.toLowerCase()} account
      </Button>
    </form>
  );
}
