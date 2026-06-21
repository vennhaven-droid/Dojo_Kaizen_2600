import { createClient } from "@/lib/supabase/server";
import { getRevenueStats, getAccountsReceivable } from "@/lib/payments";
import { MetricCard } from "@/components/portals/portal-shell";
import { formatPeso, todayISO } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const today = todayISO();

  const [
    { count: totalStudents },
    { count: activeStudents },
    { count: newEnrollments },
    { count: newInquiries },
    { data: allStudents },
    { count: parents },
    { count: coaches },
    { count: attendanceToday },
    revenue,
    ar,
  ] = await Promise.all([
    supabase?.from("students").select("*", { count: "exact", head: true }) ?? { count: 0 },
    supabase?.from("students").select("*", { count: "exact", head: true }).eq("status", "ACTIVE") ?? { count: 0 },
    supabase?.from("enrollment_leads").select("*", { count: "exact", head: true }).eq("status", "NEW") ?? { count: 0 },
    supabase?.from("contact_inquiries").select("*", { count: "exact", head: true }).eq("status", "NEW") ?? { count: 0 },
    supabase?.from("students").select("birthday") ?? { data: [] },
    supabase?.from("profiles").select("*", { count: "exact", head: true }).eq("role", "PARENT") ?? { count: 0 },
    supabase?.from("coaches").select("*", { count: "exact", head: true }).eq("is_active", true) ?? { count: 0 },
    supabase?.from("attendance").select("*", { count: "exact", head: true }).eq("date", today) ?? { count: 0 },
    getRevenueStats(),
    getAccountsReceivable(),
  ]);

  let childCount = 0, teenCount = 0, adultCount = 0;
  for (const s of allStudents ?? []) {
    if (!s.birthday) { adultCount++; continue; }
    const age = new Date().getFullYear() - new Date(s.birthday).getFullYear();
    if (age < 13) childCount++;
    else if (age < 18) teenCount++;
    else adultCount++;
  }

  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const { data: birthdays } = await supabase
    ?.from("students")
    .select("first_name, last_name, birthday")
    .not("birthday", "is", null) ?? { data: [] };

  const birthdaysThisWeek = (birthdays ?? []).filter((s) => {
    if (!s.birthday) return false;
    const bday = new Date(s.birthday);
    const now = new Date();
    bday.setFullYear(now.getFullYear());
    return bday >= now && bday <= weekEnd;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-kaizen-gray">Executive Dashboard</h2>
          <p className="text-sm text-kaizen-muted">Real-time academy overview</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm"><Link href="/admin/enrollments">Enrollments</Link></Button>
          <Button asChild variant="secondary" size="sm"><Link href="/admin/inquiries">Inquiries</Link></Button>
          <Button asChild variant="secondary" size="sm"><Link href="/admin/students/new">+ Student</Link></Button>
          <Button asChild variant="gold" size="sm"><Link href="/admin/payments">Record Payment</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Students" value={totalStudents ?? 0} sub={`${activeStudents ?? 0} active`} />
        <MetricCard label="New Enrollments" value={newEnrollments ?? 0} variant="gold" sub="pending review" />
        <MetricCard label="New Inquiries" value={newInquiries ?? 0} sub="contact form" />
        <MetricCard label="Attendance Today" value={attendanceToday ?? 0} variant="success" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Revenue Today" value={formatPeso(revenue.today)} />
        <MetricCard label="Revenue This Month" value={formatPeso(revenue.month)} variant="gold" />
        <MetricCard label="Outstanding" value={formatPeso(ar.totalOutstanding)} variant="danger" sub={`${ar.overdue.length} overdue`} />
        <MetricCard label="Birthdays This Week" value={birthdaysThisWeek.length} variant="success" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Child Students" value={childCount} />
        <MetricCard label="Teen Students" value={teenCount} />
        <MetricCard label="Adult Students" value={adultCount} />
        <MetricCard label="Parents" value={parents ?? 0} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Coaches" value={coaches ?? 0} />
        <MetricCard label="Parents" value={parents ?? 0} />
        <MetricCard label="Locker Revenue" value={formatPeso(revenue.locker)} />
      </div>
    </div>
  );
}
