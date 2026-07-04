import { createClient } from "@/lib/supabase/server";
import { getAccountsReceivable } from "@/lib/payments";
import { RecordPaymentForm } from "@/components/admin/record-payment-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPeso } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  AdminTableShell,
  MobileEmptyState,
  MobileRecordCard,
  ResponsiveTable,
} from "@/components/admin/responsive-list";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const [ar, { data: students }, { data: recentPayments }] = await Promise.all([
    getAccountsReceivable(),
    supabase?.from("students").select("id, first_name, last_name").eq("status", "ACTIVE").order("last_name") ?? { data: [] },
    supabase
      ?.from("payments")
      .select("*, students(first_name, last_name), memberships(type, programs(name))")
      .order("paid_at", { ascending: false })
      .limit(20) ?? { data: [] },
  ]);

  const payments = recentPayments ?? [];

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">Payments</h2>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="rounded-xl border border-red-500/30 bg-kaizen-dark p-4">
          <p className="text-sm text-kaizen-muted">Overdue</p>
          <p className="text-2xl font-bold text-red-400">{ar.overdue.length}</p>
        </div>
        <div className="rounded-xl border border-yellow-500/30 bg-kaizen-dark p-4">
          <p className="text-sm text-kaizen-muted">Due Today</p>
          <p className="text-2xl font-bold">{ar.dueToday.length}</p>
        </div>
        <div className="rounded-xl border border-blue/30 bg-kaizen-dark p-4">
          <p className="text-sm text-kaizen-muted">Due This Week</p>
          <p className="text-2xl font-bold">{ar.dueWeek.length}</p>
        </div>
        <div className="rounded-xl border border-gold/30 bg-kaizen-dark p-4 col-span-2 sm:col-span-1">
          <p className="text-sm text-kaizen-muted">Outstanding</p>
          <p className="text-2xl font-bold text-gold">{formatPeso(ar.totalOutstanding)}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <RecordPaymentForm students={students ?? []} />

        <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
          <h3 className="font-display text-lg text-gold mb-4">Overdue Accounts</h3>
          <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
            {ar.overdue.map((m) => {
              const student = m.students as { first_name?: string; last_name?: string } | null;
              const program = m.programs as { name?: string } | null;
              return (
                <li
                  key={m.id}
                  className="flex flex-col gap-1 border-b border-blue/10 pb-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="break-words">
                    {student?.first_name} {student?.last_name} · {program?.name} · {m.type}
                  </span>
                  <Badge variant="danger" className="w-fit shrink-0">Due {m.due_date}</Badge>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {payments.length === 0 ? (
        <MobileEmptyState message="No recent payments." />
      ) : (
        <ResponsiveTable
          desktop={
            <AdminTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Program / Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => {
                    const student = p.students as { first_name?: string; last_name?: string } | null;
                    const membership = p.memberships as { type?: string; programs?: { name?: string } } | null;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : p.due_date ?? "—"}</TableCell>
                        <TableCell>{student?.first_name} {student?.last_name}</TableCell>
                        <TableCell>
                          {membership?.programs?.name ?? "—"} {membership?.type ? `· ${membership.type}` : ""}
                        </TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell className="text-gold">{formatPeso(Number(p.amount))}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AdminTableShell>
          }
          mobile={payments.map((p) => {
            const student = p.students as { first_name?: string; last_name?: string } | null;
            const membership = p.memberships as { type?: string; programs?: { name?: string } } | null;
            const name = `${student?.first_name ?? ""} ${student?.last_name ?? ""}`.trim();
            return (
              <MobileRecordCard
                key={p.id}
                title={name || "Unknown student"}
                subtitle={p.paid_at ? new Date(p.paid_at).toLocaleDateString() : p.due_date ?? "—"}
                badge={<span className="font-semibold text-gold">{formatPeso(Number(p.amount))}</span>}
                rows={[
                  {
                    label: "Program",
                    value: `${membership?.programs?.name ?? "—"}${membership?.type ? ` · ${membership.type}` : ""}`,
                  },
                  { label: "Method", value: p.method },
                ]}
              />
            );
          })}
        />
      )}
    </div>
  );
}
