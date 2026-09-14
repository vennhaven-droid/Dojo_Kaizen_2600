import { createClient as createJwtClient } from "@supabase/supabase-js";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import type { Profile, UserRole } from "@/lib/types";

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

export async function getProfileFromRequest(request: Request): Promise<Profile | null> {
  const token = bearerToken(request);
  if (token && isSupabaseConfigured()) {
    const supabase = createJwtClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    return (data as Profile | null) ?? null;
  }

  return getCurrentProfile();
}

export function isStaffRole(role: string | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "COACH";
}

export async function canAccessStudentAttendance(
  profile: Profile,
  studentId: string
): Promise<boolean> {
  if (isStaffRole(profile.role)) return true;

  const admin = createAdminClient();
  const supabase = admin ?? (await createClient());
  if (!supabase) return false;

  if (profile.role === "STUDENT") {
    const { data } = await supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .eq("profile_id", profile.id)
      .maybeSingle();
    return Boolean(data);
  }

  if (profile.role === "PARENT") {
    const { data } = await supabase
      .from("parent_students")
      .select("student_id")
      .eq("parent_id", profile.id)
      .eq("student_id", studentId)
      .maybeSingle();
    return Boolean(data);
  }

  return false;
}

export async function studentsForProfile(profile: Profile) {
  const admin = createAdminClient();
  const supabase = admin ?? (await createClient());
  if (!supabase) return [];

  if (profile.role === "STUDENT") {
    const { data } = await supabase
      .from("students")
      .select("id, first_name, last_name, status, profile_id")
      .eq("profile_id", profile.id);
    return data ?? [];
  }

  if (profile.role === "PARENT") {
    const { data: links } = await supabase
      .from("parent_students")
      .select("student_id")
      .eq("parent_id", profile.id);
    const ids = (links ?? []).map((row) => row.student_id);
    if (ids.length === 0) return [];
    const { data } = await supabase
      .from("students")
      .select("id, first_name, last_name, status, profile_id")
      .in("id", ids);
    return data ?? [];
  }

  return [];
}

export async function defaultStudentId(profile: Profile): Promise<string | undefined> {
  const students = await studentsForProfile(profile);
  return students[0]?.id;
}

export type MeStudent = {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  due_date: string | null;
  balance: number;
  checked_in: boolean;
  checked_out: boolean;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    payment_status: string | null;
    paid_at: string | null;
    due_date: string | null;
  }>;
  memberships: Array<{
    id: string;
    type: string;
    status: string;
    due_date: string | null;
    program_name: string | null;
  }>;
};

export async function buildMePayload(profile: Profile) {
  const admin = createAdminClient();
  const supabase = admin ?? (await createClient());
  const students = await studentsForProfile(profile);
  const today = new Date().toISOString().split("T")[0];

  const detailed: MeStudent[] = [];
  if (supabase) {
    for (const student of students) {
      const [{ data: memberships }, { data: payments }, { data: attendance }] = await Promise.all([
        supabase
          .from("memberships")
          .select("id, type, status, due_date, custom_rate, programs(name)")
          .eq("student_id", student.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select("id, amount, method, payment_status, paid_at, due_date")
          .eq("student_id", student.id)
          .order("paid_at", { ascending: false })
          .limit(30),
        supabase
          .from("attendance")
          .select("checked_out_at")
          .eq("student_id", student.id)
          .eq("date", today)
          .maybeSingle(),
      ]);

      const overdue = (memberships ?? []).filter(
        (m) => m.status === "ACTIVE" && m.due_date && m.due_date < today
      );
      const balance = overdue.reduce((sum, m) => sum + Number(m.custom_rate ?? 0), 0);
      const nextDue =
        (memberships ?? [])
          .filter((m) => m.status === "ACTIVE" && m.due_date)
          .map((m) => m.due_date as string)
          .sort()[0] ?? null;

      detailed.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        status: student.status,
        due_date: nextDue,
        balance,
        checked_in: Boolean(attendance),
        checked_out: Boolean(attendance?.checked_out_at),
        payments: (payments ?? []).map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          method: p.method,
          payment_status: p.payment_status,
          paid_at: p.paid_at,
          due_date: p.due_date,
        })),
        memberships: (memberships ?? []).map((m) => ({
          id: m.id,
          type: m.type,
          status: m.status,
          due_date: m.due_date,
          program_name: Array.isArray(m.programs)
            ? (m.programs[0] as { name?: string } | undefined)?.name ?? null
            : ((m.programs as { name?: string } | null)?.name ?? null),
        })),
      });
    }
  }

  let canManageChat = profile.role === "SUPER_ADMIN";
  if (!canManageChat && supabase && isStaffRole(profile.role)) {
    const { data: perms } = await supabase
      .from("admin_permissions")
      .select("manage_chat, full_admin_access, is_active")
      .eq("profile_id", profile.id)
      .maybeSingle();
    canManageChat = Boolean(
      perms?.is_active && (perms.full_admin_access || perms.manage_chat)
    );
  }

  return {
    profile: {
      id: profile.id,
      role: profile.role as UserRole,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      avatar_url: profile.avatar_url,
    },
    students: detailed,
    canManageChat,
  };
}
