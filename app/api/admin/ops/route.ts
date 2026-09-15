import { checkInStudent, checkOutStudent } from "@/lib/attendance";
import { corsPreflight, jsonWithCors } from "@/lib/http/cors";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireStaffApi } from "@/lib/supabase/request-auth";
import { todayISO } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";
import type { PermissionFlag } from "@/lib/permissions";

export function OPTIONS() {
  return corsPreflight();
}

const SECTION_FLAGS: Record<string, PermissionFlag | undefined> = {
  students: "view_students",
  enrollments: "manage_enrollments",
  inquiries: "view_inquiries",
  payments: "view_payments",
  attendance: "view_students",
  users: "manage_staff",
  programs: "manage_programs",
  coaches: "manage_coaches",
  pricing: "manage_pricing",
  lockers: "view_students",
  competitions: "view_students",
};

async function db() {
  return createAdminClient() ?? (await createClient());
}

export async function GET(request: Request) {
  const section = new URL(request.url).searchParams.get("section") ?? "students";
  const flag = SECTION_FLAGS[section];
  const auth = await requireStaffApi(request, flag);
  if (!auth.profile) return jsonWithCors({ error: auth.error }, auth.status);

  const supabase = await db();
  if (!supabase) return jsonWithCors({ error: "Database not configured" }, 500);
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (section === "students") {
    let query = supabase
      .from("students")
      .select("id, first_name, last_name, email, phone, status, birthday, student_stats(total_visits, last_visit), memberships(status, programs(name))")
      .order("last_name")
      .limit(80);
    if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
    const { data } = await query;
    return jsonWithCors({ students: data ?? [] });
  }

  if (section === "enrollments") {
    const archived = new URL(request.url).searchParams.get("view") === "archived";
    let query = supabase.from("enrollment_leads").select("*").order("created_at", { ascending: false }).limit(80);
    query = archived ? query.eq("status", "ARCHIVED") : query.neq("status", "ARCHIVED");
    const { data } = await query;
    return jsonWithCors({ enrollments: data ?? [] });
  }

  if (section === "inquiries") {
    const { data } = await supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false }).limit(80);
    return jsonWithCors({ inquiries: data ?? [] });
  }

  if (section === "payments") {
    const { data } = await supabase
      .from("payments")
      .select("id, amount, method, payment_status, paid_at, due_date, students(first_name, last_name)")
      .order("paid_at", { ascending: false })
      .limit(40);
    const { data: students } = await supabase.from("students").select("id, first_name, last_name").eq("status", "ACTIVE").order("last_name");
    return jsonWithCors({ payments: data ?? [], students: students ?? [] });
  }

  if (section === "attendance") {
    const today = todayISO();
    const [{ data: todayAttendance }, { data: students }] = await Promise.all([
      supabase.from("attendance").select("id, date, checked_in_at, checked_out_at, students(id, first_name, last_name)").eq("date", today).order("checked_in_at", { ascending: false }),
      supabase.from("students").select("id, first_name, last_name").eq("status", "ACTIVE").order("last_name"),
    ]);
    return jsonWithCors({ date: today, attendance: todayAttendance ?? [], students: students ?? [] });
  }

  if (section === "users") {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, role, is_active")
      .in("role", ["ADMIN", "COACH", "STUDENT", "PARENT"])
      .order("created_at", { ascending: false })
      .limit(80);
    const { data: students } = await supabase.from("students").select("id, first_name, last_name").eq("status", "ACTIVE").order("last_name");
    return jsonWithCors({ users: data ?? [], students: students ?? [] });
  }

  if (section === "programs") {
    const { data } = await supabase.from("programs").select("id, name, description, is_active, age_min, age_max").order("sort_order");
    return jsonWithCors({ programs: data ?? [] });
  }

  if (section === "coaches") {
    const { data } = await supabase.from("coaches").select("id, bio, is_active, photo_url, profiles(first_name, last_name, email)").order("sort_order");
    return jsonWithCors({ coaches: data ?? [] });
  }

  if (section === "pricing") {
    const { data } = await supabase.from("cms_pricing").select("id, name, price, category, description, is_active").order("sort_order");
    return jsonWithCors({ pricing: data ?? [] });
  }

  if (section === "lockers") {
    const { data } = await supabase
      .from("lockers")
      .select("id, number, status, monthly_rate, locker_rentals(student_id, renewal_date, students(first_name, last_name))")
      .order("number");
    return jsonWithCors({ lockers: data ?? [] });
  }

  if (section === "competitions") {
    const { data } = await supabase
      .from("competitions")
      .select("id, name, date, division, result, medal, students(first_name, last_name)")
      .order("date", { ascending: false })
      .limit(40);
    return jsonWithCors({ competitions: data ?? [] });
  }

  return jsonWithCors({ error: "Unknown section" }, 400);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "");

  const flag: PermissionFlag | undefined =
    action === "update_enrollment" || action === "archive_enrollment"
      ? "manage_enrollments"
      : action === "update_inquiry"
        ? "manage_inquiries"
        : action === "record_payment"
          ? "create_edit_payments"
          : action === "create_user"
            ? "manage_staff"
            : action === "checkin" || action === "checkout"
              ? "view_students"
              : undefined;

  const auth = await requireStaffApi(request, flag);
  if (!auth.profile) return jsonWithCors({ error: auth.error }, auth.status);
  const supabase = await db();
  if (!supabase) return jsonWithCors({ error: "Database not configured" }, 500);

  if (action === "update_enrollment") {
    const { error } = await supabase
      .from("enrollment_leads")
      .update({
        status: String(body.status ?? ""),
        notes: body.notes ? String(body.notes) : null,
      })
      .eq("id", String(body.id));
    if (error) return jsonWithCors({ error: error.message }, 400);
    return jsonWithCors({ success: true });
  }

  if (action === "archive_enrollment") {
    const { error } = await supabase.from("enrollment_leads").update({ status: "ARCHIVED" }).eq("id", String(body.id));
    if (error) return jsonWithCors({ error: error.message }, 400);
    return jsonWithCors({ success: true });
  }

  if (action === "update_inquiry") {
    const { error } = await supabase
      .from("contact_inquiries")
      .update({
        status: String(body.status ?? ""),
        admin_notes: body.admin_notes ? String(body.admin_notes) : null,
      })
      .eq("id", String(body.id));
    if (error) return jsonWithCors({ error: error.message }, 400);
    return jsonWithCors({ success: true });
  }

  if (action === "record_payment") {
    const amount = Number(body.amount);
    if (!body.student_id || !Number.isFinite(amount) || amount <= 0) {
      return jsonWithCors({ error: "Student and amount are required." }, 400);
    }
    const { data, error } = await supabase
      .from("payments")
      .insert({
        student_id: String(body.student_id),
        amount,
        method: (body.method as PaymentMethod) ?? "CASH",
        payment_type: "membership",
        paid_at: new Date().toISOString(),
        payment_status: "PAID",
        amount_due: amount,
        amount_paid: amount,
      })
      .select("id")
      .single();
    if (error) return jsonWithCors({ error: error.message }, 400);
    return jsonWithCors({ success: true, payment: data });
  }

  if (action === "checkin") {
    const result = await checkInStudent(String(body.student_id), "ADMIN_OVERRIDE");
    return jsonWithCors(result, result.success ? 200 : 400);
  }

  if (action === "checkout") {
    const result = await checkOutStudent(String(body.student_id));
    return jsonWithCors(result, result.success ? 200 : 400);
  }

  if (action === "create_user") {
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const firstName = String(body.first_name ?? "").trim();
    const lastName = String(body.last_name ?? "").trim();
    const role = String(body.role ?? "STUDENT");
    if (!email || !password || password.length < 8) {
      return jsonWithCors({ error: "Email and a password of at least 8 characters are required." }, 400);
    }
    const admin = createAdminClient();
    if (!admin) return jsonWithCors({ error: "Database not configured" }, 500);
    const { data: authUser, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });
    if (error || !authUser.user) return jsonWithCors({ error: error?.message ?? "Could not create user" }, 400);
    await admin.from("profiles").upsert({
      id: authUser.user.id,
      role,
      first_name: firstName,
      last_name: lastName,
      email,
      is_active: true,
    });
    if (role === "PARENT" && body.student_id) {
      await admin.from("parent_students").insert({
        parent_id: authUser.user.id,
        student_id: String(body.student_id),
      });
    }
    return jsonWithCors({ success: true, id: authUser.user.id });
  }

  return jsonWithCors({ error: "Unknown action" }, 400);
}
