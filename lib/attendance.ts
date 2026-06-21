import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayISO } from "@/lib/utils";
import type { CheckInMethod } from "@/lib/types";

export interface CheckInResult {
  success: boolean;
  message: string;
  warning?: string;
  attendanceId?: string;
}

export async function checkInStudent(
  studentId: string,
  method: CheckInMethod = "LOGIN"
): Promise<CheckInResult> {
  const supabase = createAdminClient() ?? (await createClient());
  if (!supabase) {
    return { success: false, message: "Database not configured" };
  }

  const today = todayISO();

  const { data: existing } = await supabase
    .from("attendance")
    .select("id")
    .eq("student_id", studentId)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    return { success: false, message: "Already checked in today" };
  }

  const { data: student } = await supabase
    .from("students")
    .select("status")
    .eq("id", studentId)
    .single();

  if (!student || student.status === "SUSPENDED") {
    return { success: false, message: "Account is not active" };
  }

  let warning: string | undefined;
  const { data: overdueMemberships } = await supabase
    .from("memberships")
    .select("id, due_date, status")
    .eq("student_id", studentId)
    .eq("status", "ACTIVE")
    .lt("due_date", today);

  if (overdueMemberships && overdueMemberships.length > 0) {
    warning = "Payment overdue — please visit the front desk";
  }

  const { data: sessionPkg } = await supabase
    .from("memberships")
    .select("id, type, session_packages(*)")
    .eq("student_id", studentId)
    .eq("type", "SESSION_PACKAGE")
    .eq("status", "ACTIVE")
    .limit(1)
    .maybeSingle();

  if (sessionPkg?.session_packages) {
    const pkg = Array.isArray(sessionPkg.session_packages)
      ? sessionPkg.session_packages[0]
      : sessionPkg.session_packages;
    if (pkg && pkg.remaining <= 0) {
      return { success: false, message: "No sessions remaining in package" };
    }
  }

  const { data: attendance, error } = await supabase
    .from("attendance")
    .insert({ student_id: studentId, date: today, check_in_method: method })
    .select("id")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  if (sessionPkg?.session_packages) {
    const pkg = Array.isArray(sessionPkg.session_packages)
      ? sessionPkg.session_packages[0]
      : sessionPkg.session_packages;
    if (pkg) {
      await supabase
        .from("session_packages")
        .update({
          used: pkg.used + 1,
          remaining: Math.max(0, pkg.remaining - 1),
        })
        .eq("id", pkg.id);
    }
  }

  await updateStudentStats(supabase, studentId, today);
  await evaluateAchievements(supabase, studentId);

  return {
    success: true,
    message: "Checked in successfully!",
    warning,
    attendanceId: attendance.id,
  };
}

export async function checkOutStudent(studentId: string): Promise<CheckInResult> {
  const supabase = createAdminClient() ?? (await createClient());
  if (!supabase) {
    return { success: false, message: "Database not configured" };
  }

  const today = todayISO();
  const { data: attendance } = await supabase
    .from("attendance")
    .select("id, checked_in_at, checked_out_at")
    .eq("student_id", studentId)
    .eq("date", today)
    .maybeSingle();

  if (!attendance) {
    return { success: false, message: "You have not checked in today" };
  }
  if (attendance.checked_out_at) {
    return { success: false, message: "Already checked out today" };
  }

  const now = new Date();
  const checkedIn = new Date(attendance.checked_in_at);
  const durationMinutes = Math.max(1, Math.round((now.getTime() - checkedIn.getTime()) / 60000));

  const { error } = await supabase
    .from("attendance")
    .update({ checked_out_at: now.toISOString(), duration_minutes: durationMinutes })
    .eq("id", attendance.id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: `Great session! ${durationMinutes} minutes logged.` };
}

async function updateStudentStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string,
  today: string
) {
  if (!supabase) return;

  const { data: stats } = await supabase
    .from("student_stats")
    .select("*")
    .eq("student_id", studentId)
    .single();

  const monthStart = today.slice(0, 7) + "-01";
  const yearStart = today.slice(0, 4) + "-01-01";

  const { count: monthlyCount } = await supabase
    .from("attendance")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId)
    .gte("date", monthStart);

  const { count: yearlyCount } = await supabase
    .from("attendance")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId)
    .gte("date", yearStart);

  const totalVisits = (stats?.total_visits ?? 0) + 1;
  let currentStreak = 1;
  const lastVisit = stats?.last_visit;

  if (lastVisit) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    if (lastVisit === yesterdayStr) {
      currentStreak = (stats?.current_streak ?? 0) + 1;
    }
  }

  const longestStreak = Math.max(stats?.longest_streak ?? 0, currentStreak);
  const xpPoints = (stats?.xp_points ?? 0) + 10;
  const level = Math.floor(xpPoints / 100) + 1;

  await supabase.from("student_stats").upsert({
    student_id: studentId,
    total_visits: totalVisits,
    monthly_visits: monthlyCount ?? 0,
    yearly_visits: yearlyCount ?? 0,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    xp_points: xpPoints,
    level,
    last_visit: today,
    updated_at: new Date().toISOString(),
  });
}

async function evaluateAchievements(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string
) {
  if (!supabase) return;

  const { data: stats } = await supabase
    .from("student_stats")
    .select("total_visits, current_streak")
    .eq("student_id", studentId)
    .single();

  if (!stats) return;

  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("category", "attendance");

  const { data: earned } = await supabase
    .from("student_achievements")
    .select("achievement_id")
    .eq("student_id", studentId);

  const earnedIds = new Set((earned ?? []).map((e) => e.achievement_id));

  for (const achievement of achievements ?? []) {
    if (earnedIds.has(achievement.id)) continue;
    if (!achievement.threshold) continue;

    const met =
      achievement.slug.includes("streak") || achievement.slug === "consistency-master"
        ? stats.current_streak >= achievement.threshold
        : stats.total_visits >= achievement.threshold;

    if (met) {
      await supabase.from("student_achievements").insert({
        student_id: studentId,
        achievement_id: achievement.id,
      });
    }
  }
}

export async function getAttendanceHeatmap(studentId: string, year: number) {
  const supabase = await createClient();
  if (!supabase) return [];
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const { data } = await supabase
    .from("attendance")
    .select("date")
    .eq("student_id", studentId)
    .gte("date", start)
    .lte("date", end);
  return (data ?? []).map((a) => a.date);
}
