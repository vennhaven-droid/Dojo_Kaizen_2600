"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { calculateAge, formatPeso } from "@/lib/utils";

type Tab = "profile" | "memberships" | "attendance" | "payments" | "notes";

type StudentDetailTabsProps = {
  student: Record<string, unknown>;
  memberships: Array<Record<string, unknown>>;
  payments: Array<Record<string, unknown>>;
  attendance: Array<Record<string, unknown>>;
  profileChanges: Array<Record<string, unknown>>;
  studentNotes: Array<Record<string, unknown>>;
};

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "memberships", label: "Memberships" },
  { id: "attendance", label: "Attendance" },
  { id: "payments", label: "Payments" },
  { id: "notes", label: "Notes" },
];

export function StudentDetailTabs({
  student,
  memberships,
  payments,
  attendance,
  profileChanges,
  studentNotes,
}: StudentDetailTabsProps) {
  const [tab, setTab] = useState<Tab>("profile");
  const medical = student.medical as Record<string, string> | null;
  const stats = student.student_stats as { total_visits?: number; current_streak?: number; xp_points?: number; level?: number } | null;
  const guardians = student.guardians as Array<{ name: string; relationship: string; phone?: string }> | null;

  return (
    <>
      <nav className="flex flex-wrap gap-2 border-b border-blue/20 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              tab === t.id ? "bg-gold/20 text-gold" : "text-kaizen-muted hover:text-kaizen-silver"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "profile" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
              <h3 className="font-display text-lg text-gold">Profile</h3>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                <div><dt className="text-kaizen-muted">Age</dt><dd>{calculateAge(student.birthday as string | null) ?? "—"}</dd></div>
                <div><dt className="text-kaizen-muted">Phone</dt><dd>{String(student.phone ?? "—")}</dd></div>
                <div><dt className="text-kaizen-muted">Email</dt><dd>{String(student.email ?? "—")}</dd></div>
                <div><dt className="text-kaizen-muted">Address</dt><dd>{String(student.address ?? "—")}</dd></div>
              </dl>
              {(guardians ?? []).length > 0 && (
                <div className="mt-4 border-t border-blue/10 pt-4">
                  <p className="text-sm font-semibold text-gold">Guardians</p>
                  {(guardians ?? []).map((g, i) => (
                    <p key={i} className="mt-1 text-sm text-kaizen-muted">{g.name} ({g.relationship}) — {g.phone ?? "—"}</p>
                  ))}
                </div>
              )}
            </section>
            {profileChanges.length > 0 && (
              <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
                <h3 className="font-display text-lg text-gold">Profile Change Log</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {profileChanges.map((c) => (
                    <li key={String(c.id)} className="border-b border-blue/10 pb-2">
                      <span className="text-gold">{String(c.field_name)}</span>: {String(c.old_value ?? "—")} → {String(c.new_value ?? "—")}
                      <span className="ml-2 text-xs text-kaizen-muted">{new Date(String(c.created_at)).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          <div className="space-y-6">
            <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
              <h3 className="font-display text-lg text-gold">Stats</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Visits</dt><dd>{stats?.total_visits ?? 0}</dd></div>
                <div className="flex justify-between"><dt>Streak</dt><dd className="streak-fire">{stats?.current_streak ?? 0} days</dd></div>
                <div className="flex justify-between"><dt>Level</dt><dd>{stats?.level ?? 1}</dd></div>
                <div className="flex justify-between"><dt>XP</dt><dd>{stats?.xp_points ?? 0}</dd></div>
              </dl>
            </div>
            {medical && (
              <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
                <h3 className="font-display text-lg text-gold">Medical</h3>
                <p className="mt-2 text-sm text-kaizen-muted">{medical.allergies || medical.conditions || "None noted"}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "memberships" && (
        <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
          <h3 className="font-display text-lg text-gold">Memberships</h3>
          {memberships.length === 0 ? (
            <p className="mt-2 text-sm text-kaizen-muted">No memberships</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {memberships.map((m) => {
                const program = m.programs as { name?: string; default_price?: number } | null;
                const pkg = m.session_packages as { remaining?: number } | Array<{ remaining?: number }> | null;
                const sessionPkg = Array.isArray(pkg) ? pkg[0] : pkg;
                return (
                  <li key={String(m.id)} className="flex justify-between text-sm border-b border-blue/10 pb-2">
                    <span>{program?.name} · {String(m.type)} · <Badge>{String(m.status)}</Badge></span>
                    <span>
                      {sessionPkg ? `${sessionPkg.remaining} sessions left` : formatPeso(Number(m.custom_rate ?? program?.default_price ?? 0))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {tab === "attendance" && (
        <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
          <h3 className="font-display text-lg text-gold">Recent Attendance</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {attendance.length === 0 && <p className="text-kaizen-muted">No attendance records</p>}
            {attendance.map((a) => (
              <li key={String(a.id)} className="flex justify-between border-b border-blue/10 pb-2">
                <span>{String(a.date)}</span>
                <span className="text-kaizen-muted">
                  {a.checked_out_at ? `${String(a.duration_minutes ?? "—")} min` : "Checked in"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "payments" && (
        <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
          <h3 className="font-display text-lg text-gold">Payments</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {payments.length === 0 && <p className="text-kaizen-muted">No payments</p>}
            {payments.map((p) => (
              <li key={String(p.id)} className="flex justify-between">
                <span>{new Date(String(p.paid_at ?? p.due_date)).toLocaleDateString()} · {String(p.method ?? "—")}</span>
                <span className="text-gold">{formatPeso(Number(p.amount))}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "notes" && (
        <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
          <h3 className="font-display text-lg text-gold">Progress Notes</h3>
          {String(student.notes ?? "") && (
            <p className="mt-2 text-sm text-kaizen-silver whitespace-pre-wrap">{String(student.notes)}</p>
          )}
          <ul className="mt-4 space-y-3 text-sm">
            {studentNotes.map((n) => (
              <li key={String(n.id)} className="rounded-lg border border-blue/10 p-3">
                <p>{String(n.content)}</p>
                <p className="mt-1 text-xs text-kaizen-muted">{new Date(String(n.created_at)).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
          {studentNotes.length === 0 && !student.notes && (
            <p className="mt-2 text-sm text-kaizen-muted">No notes yet</p>
          )}
        </section>
      )}
    </>
  );
}
