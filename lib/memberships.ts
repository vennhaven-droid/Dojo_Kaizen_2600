import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";

export async function getStudentMemberships(studentId: string) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("memberships")
    .select("*, programs(name, slug), session_packages(*)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getOverdueMemberships() {
  const supabase = await createClient();
  if (!supabase) return [];
  const today = todayISO();
  const { data } = await supabase
    .from("memberships")
    .select("*, students(first_name, last_name), programs(name)")
    .eq("status", "ACTIVE")
    .not("due_date", "is", null)
    .lt("due_date", today)
    .order("due_date");
  return data ?? [];
}

export async function getUpcomingRenewals(days = 7) {
  const supabase = await createClient();
  if (!supabase) return [];
  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + days);
  const { data } = await supabase
    .from("memberships")
    .select("*, students(first_name, last_name), programs(name)")
    .eq("status", "ACTIVE")
    .gte("due_date", todayISO())
    .lte("due_date", future.toISOString().split("T")[0])
    .order("due_date");
  return data ?? [];
}

export async function createMembership(input: {
  student_id: string;
  program_id: string;
  type: string;
  pricing_type?: string;
  custom_rate?: number;
  due_date?: string;
  sessions?: number;
}) {
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { data: membership, error } = await supabase
    .from("memberships")
    .insert({
      student_id: input.student_id,
      program_id: input.program_id,
      type: input.type,
      pricing_type: input.pricing_type ?? "REGULAR",
      custom_rate: input.custom_rate,
      due_date: input.due_date,
      status: "ACTIVE",
      start_date: todayISO(),
    })
    .select("id")
    .single();

  if (error) throw error;

  if (input.type === "SESSION_PACKAGE" && input.sessions) {
    await supabase.from("session_packages").insert({
      membership_id: membership.id,
      purchased: input.sessions,
      used: 0,
      remaining: input.sessions,
    });
  }

  return membership;
}
