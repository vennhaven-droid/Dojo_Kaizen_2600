import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

export async function recordPayment(input: {
  student_id: string;
  amount: number;
  method: PaymentMethod;
  reference_number?: string;
  membership_id?: string;
  locker_rental_id?: string;
  payment_type?: string;
  notes?: string;
}) {
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { data, error } = await supabase
    .from("payments")
    .insert({
      student_id: input.student_id,
      amount: input.amount,
      method: input.method,
      reference_number: input.reference_number,
      membership_id: input.membership_id,
      locker_rental_id: input.locker_rental_id,
      payment_type: input.payment_type ?? "membership",
      notes: input.notes,
      paid_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;

  if (input.membership_id) {
    const nextDue = new Date();
    nextDue.setMonth(nextDue.getMonth() + 1);
    await supabase
      .from("memberships")
      .update({ due_date: nextDue.toISOString().split("T")[0] })
      .eq("id", input.membership_id);
  }

  return data;
}

export async function getAccountsReceivable() {
  const supabase = await createClient();
  if (!supabase) return { dueToday: [], dueWeek: [], dueMonth: [], overdue: [], totalOutstanding: 0 };

  const today = todayISO();
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const monthEnd = new Date();
  monthEnd.setDate(monthEnd.getDate() + 30);

  const { data: allDue } = await supabase
    .from("memberships")
    .select("*, students(first_name, last_name), programs(name)")
    .eq("status", "ACTIVE")
    .not("due_date", "is", null)
    .lte("due_date", monthEnd.toISOString().split("T")[0])
    .order("due_date");

  const memberships = allDue ?? [];
  const dueToday = memberships.filter((m) => m.due_date === today);
  const dueWeek = memberships.filter(
    (m) => m.due_date && m.due_date > today && m.due_date <= weekEnd.toISOString().split("T")[0]
  );
  const dueMonth = memberships.filter(
    (m) => m.due_date && m.due_date > weekEnd.toISOString().split("T")[0]
  );
  const overdue = memberships.filter((m) => m.due_date && m.due_date < today);

  const totalOutstanding = overdue.reduce(
    (sum, m) => sum + Number(m.custom_rate ?? m.programs?.default_price ?? 0),
    0
  );

  return { dueToday, dueWeek, dueMonth, overdue, totalOutstanding };
}

export async function getRevenueStats() {
  const supabase = await createClient();
  if (!supabase) return { today: 0, month: 0, locker: 0 };

  const today = todayISO();
  const monthStart = today.slice(0, 7) + "-01";

  const { data: todayPayments } = await supabase
    .from("payments")
    .select("amount")
    .gte("paid_at", today);

  const { data: monthPayments } = await supabase
    .from("payments")
    .select("amount")
    .gte("paid_at", monthStart);

  const { data: lockerPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("payment_type", "locker")
    .gte("paid_at", monthStart);

  return {
    today: (todayPayments ?? []).reduce((s, p) => s + Number(p.amount), 0),
    month: (monthPayments ?? []).reduce((s, p) => s + Number(p.amount), 0),
    locker: (lockerPayments ?? []).reduce((s, p) => s + Number(p.amount), 0),
  };
}

export async function getStudentPayments(studentId: string) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("student_id", studentId)
    .order("paid_at", { ascending: false });
  return data ?? [];
}

export async function getStudentBalance(studentId: string) {
  const supabase = await createClient();
  if (!supabase) return 0;
  const today = todayISO();
  const { data } = await supabase
    .from("memberships")
    .select("custom_rate, programs(default_price)")
    .eq("student_id", studentId)
    .eq("status", "ACTIVE")
    .lt("due_date", today);

  return (data ?? []).reduce((sum, m) => {
    const programs = m.programs as { default_price?: number } | null;
    return sum + Number(m.custom_rate ?? programs?.default_price ?? 0);
  }, 0);
}
