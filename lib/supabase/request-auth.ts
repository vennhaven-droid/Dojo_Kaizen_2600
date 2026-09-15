import { createClient as createJwtClient } from "@supabase/supabase-js";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import type { Profile, UserRole } from "@/lib/types";
import { canAccessAdmin, hasPermission, type PermissionFlag } from "@/lib/permissions";

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
      .select("id, first_name, last_name, status, profile_id, phone, birthday, address, email")
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
      .select("id, first_name, last_name, status, profile_id, phone, birthday, address, email")
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
  phone: string | null;
  birthday: string | null;
  address: string | null;
  email: string | null;
  checked_in: boolean;
  checked_out: boolean;
  checked_in_at: string | null;
  checked_out_at: string | null;
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
  attendance: Array<{
    id: string;
    date: string;
    check_in_method: string | null;
    checked_in_at: string | null;
    checked_out_at: string | null;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    earned: boolean;
  }>;
  competitions: Array<{
    id: string;
    name: string;
    date: string | null;
    division: string | null;
    result: string | null;
    medal: string | null;
  }>;
};

export async function buildMePayload(profile: Profile) {
  const admin = createAdminClient();
  const supabase = admin ?? (await createClient());
  const students = await studentsForProfile(profile);
  const today = new Date().toISOString().split("T")[0];

  const detailed: MeStudent[] = [];
  if (supabase) {
    const { data: allAchievements } = await supabase.from("achievements").select("id, name, description, icon").order("threshold");

    for (const student of students) {
      const [
        { data: memberships },
        { data: payments },
        { data: todayAttendance },
        { data: attendanceRows },
        { data: earned },
        { data: competitions },
      ] = await Promise.all([
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
          .select("id, checked_in_at, checked_out_at")
          .eq("student_id", student.id)
          .eq("date", today)
          .maybeSingle(),
        supabase
          .from("attendance")
          .select("id, date, check_in_method, checked_in_at, checked_out_at")
          .eq("student_id", student.id)
          .order("date", { ascending: false })
          .limit(60),
        supabase.from("student_achievements").select("achievement_id").eq("student_id", student.id),
        supabase
          .from("competitions")
          .select("id, name, date, division, result, medal")
          .eq("student_id", student.id)
          .order("date", { ascending: false }),
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
      const earnedIds = new Set((earned ?? []).map((row) => row.achievement_id));

      detailed.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        status: student.status,
        due_date: nextDue,
        balance,
        phone: student.phone ?? null,
        birthday: student.birthday ?? null,
        address: student.address ?? null,
        email: student.email ?? null,
        checked_in: Boolean(todayAttendance),
        checked_out: Boolean(todayAttendance?.checked_out_at),
        checked_in_at: todayAttendance?.checked_in_at ?? null,
        checked_out_at: todayAttendance?.checked_out_at ?? null,
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
        attendance: (attendanceRows ?? []).map((row) => ({
          id: row.id,
          date: row.date,
          check_in_method: row.check_in_method,
          checked_in_at: row.checked_in_at,
          checked_out_at: row.checked_out_at,
        })),
        achievements: (allAchievements ?? []).map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          earned: earnedIds.has(a.id),
        })),
        competitions: (competitions ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          date: c.date,
          division: c.division,
          result: c.result,
          medal: c.medal,
        })),
      });
    }
  }

  let staffPermissions: Record<string, boolean> | null = null;
  let canManageChat = profile.role === "SUPER_ADMIN";
  if (supabase && isStaffRole(profile.role)) {
    const { data: perms } = await supabase
      .from("admin_permissions")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle();
    staffPermissions = (perms as Record<string, boolean> | null) ?? null;
    canManageChat =
      profile.role === "SUPER_ADMIN" ||
      Boolean(perms?.is_active && (perms.full_admin_access || perms.manage_chat));
  }

  const announcementAudience =
    profile.role === "PARENT" ? ["ALL", "PARENTS"] : profile.role === "STUDENT" ? ["ALL", "STUDENTS"] : ["ALL"];
  const { data: announcements } = supabase
    ? await supabase
        .from("announcements")
        .select("id, title, body, published_at")
        .eq("is_published", true)
        .in("audience", announcementAudience)
        .order("published_at", { ascending: false })
        .limit(5)
    : { data: [] };

  return {
    profile: {
      id: profile.id,
      role: profile.role as UserRole,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      avatar_url: profile.avatar_url,
      phone: profile.phone,
    },
    students: detailed,
    canManageChat,
    canAccessAdmin: isStaffRole(profile.role),
    permissions: staffPermissions,
    announcements: announcements ?? [],
  };
}

export async function requireStaffApi(request: Request, flag?: PermissionFlag) {
  const profile = await getProfileFromRequest(request);
  if (!profile) return { error: "Unauthorized", status: 401 as const, profile: null };
  if (profile.is_active === false) return { error: "Account deactivated", status: 403 as const, profile: null };
  if (!canAccessAdmin(profile.role as UserRole)) {
    return { error: "Forbidden", status: 403 as const, profile: null };
  }
  if (flag && profile.role !== "SUPER_ADMIN") {
    const admin = createAdminClient();
    const supabase = admin ?? (await createClient());
    const { data: perms } = supabase
      ? await supabase.from("admin_permissions").select("*").eq("profile_id", profile.id).maybeSingle()
      : { data: null };
    if (!hasPermission(perms, profile.role as UserRole, flag)) {
      return { error: "Forbidden", status: 403 as const, profile: null };
    }
  }
  return { error: null, status: 200 as const, profile };
}
