import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { calculateAge, formatPeso } from "@/lib/utils";
import { getStudentMemberships } from "@/lib/memberships";
import { getStudentPayments } from "@/lib/payments";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: student } = await supabase
    ?.from("students")
    .select("*, guardians(*), emergency_contacts(*), student_stats(*), parent_students(profiles(first_name, last_name, email))")
    .eq("id", id)
    .single() ?? { data: null };

  if (!student) notFound();

  const [memberships, payments] = await Promise.all([
    getStudentMemberships(id),
    getStudentPayments(id),
  ]);

  const stats = student.student_stats as { total_visits?: number; current_streak?: number; xp_points?: number; level?: number } | null;
  const medical = student.medical as Record<string, string> | null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/students" className="text-sm text-blue hover:underline">← Students</Link>
        <h2 className="font-display text-2xl font-bold">
          {student.first_name} {student.last_name}
        </h2>
        <Badge variant={student.status === "ACTIVE" ? "success" : "muted"}>{student.status}</Badge>
      </div>

      <nav className="flex gap-2 border-b border-blue/20 pb-2">
        {["Profile", "Memberships", "Attendance", "Payments", "Notes"].map((tab) => (
          <span key={tab} className="rounded-md px-3 py-1.5 text-sm text-kaizen-muted">{tab}</span>
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
            <h3 className="font-display text-lg text-gold">Profile</h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <div><dt className="text-kaizen-muted">Age</dt><dd>{calculateAge(student.birthday) ?? "—"}</dd></div>
              <div><dt className="text-kaizen-muted">Phone</dt><dd>{student.phone ?? "—"}</dd></div>
              <div><dt className="text-kaizen-muted">Email</dt><dd>{student.email ?? "—"}</dd></div>
              <div><dt className="text-kaizen-muted">Address</dt><dd>{student.address ?? "—"}</dd></div>
            </dl>
          </section>

          <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
            <h3 className="font-display text-lg text-gold">Memberships</h3>
            {memberships.length === 0 ? (
              <p className="mt-2 text-sm text-kaizen-muted">No memberships</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {memberships.map((m) => {
                  const program = m.programs as { name?: string; default_price?: number } | null;
                  const pkg = m.session_packages as { remaining?: number; purchased?: number } | Array<{ remaining?: number }> | null;
                  const sessionPkg = Array.isArray(pkg) ? pkg[0] : pkg;
                  return (
                    <li key={m.id} className="flex justify-between text-sm border-b border-blue/10 pb-2">
                      <span>{program?.name} · {m.type} · <Badge>{m.status}</Badge></span>
                      <span>
                        {sessionPkg ? `${sessionPkg.remaining} sessions left` : formatPeso(Number(m.custom_rate ?? program?.default_price ?? 0))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
            <h3 className="font-display text-lg text-gold">Recent Payments</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {payments.slice(0, 5).map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span>{new Date(p.paid_at).toLocaleDateString()} · {p.method}</span>
                  <span className="text-gold">{formatPeso(Number(p.amount))}</span>
                </li>
              ))}
            </ul>
          </section>
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
    </div>
  );
}
