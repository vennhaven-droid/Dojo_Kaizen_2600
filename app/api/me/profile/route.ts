import { corsPreflight, jsonWithCors } from "@/lib/http/cors";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getProfileFromRequest } from "@/lib/supabase/request-auth";

export function OPTIONS() {
  return corsPreflight();
}

export async function PATCH(request: Request) {
  const profile = await getProfileFromRequest(request);
  if (!profile) return jsonWithCors({ error: "Unauthorized" }, 401);
  if (profile.is_active === false) return jsonWithCors({ error: "Account deactivated" }, 403);

  const body = (await request.json().catch(() => ({}))) as {
    student_id?: string;
    phone?: string;
    birthday?: string;
    address?: string;
  };

  const admin = createAdminClient();
  const supabase = admin ?? (await createClient());
  if (!supabase) return jsonWithCors({ error: "Database not configured" }, 500);

  let studentQuery = supabase
    .from("students")
    .select("id, profile_id, phone, birthday, address")
    .limit(1);

  if (body.student_id) {
    studentQuery = supabase
      .from("students")
      .select("id, profile_id, phone, birthday, address")
      .eq("id", body.student_id)
      .limit(1);
  } else {
    studentQuery = studentQuery.eq("profile_id", profile.id);
  }

  const { data: rows } = await studentQuery;
  let student = rows?.[0];

  if (!student && profile.role === "PARENT" && body.student_id) {
    const { data: link } = await supabase
      .from("parent_students")
      .select("student_id")
      .eq("parent_id", profile.id)
      .eq("student_id", body.student_id)
      .maybeSingle();
    if (link) {
      const { data } = await supabase
        .from("students")
        .select("id, profile_id, phone, birthday, address")
        .eq("id", body.student_id)
        .maybeSingle();
      student = data ?? undefined;
    }
  }

  if (!student || (student.profile_id !== profile.id && profile.role !== "PARENT")) {
    if (!student) return jsonWithCors({ error: "Student profile not found" }, 404);
  }

  if (profile.role === "PARENT" && student) {
    const { data: link } = await supabase
      .from("parent_students")
      .select("student_id")
      .eq("parent_id", profile.id)
      .eq("student_id", student.id)
      .maybeSingle();
    if (!link) return jsonWithCors({ error: "Forbidden" }, 403);
  } else if (student && student.profile_id !== profile.id && profile.role === "STUDENT") {
    return jsonWithCors({ error: "Forbidden" }, 403);
  }

  if (!student) return jsonWithCors({ error: "Student profile not found" }, 404);

  const fields = [
    { key: "phone" as const, value: body.phone !== undefined ? String(body.phone || "") || null : undefined },
    { key: "birthday" as const, value: body.birthday !== undefined ? String(body.birthday || "") || null : undefined },
    { key: "address" as const, value: body.address !== undefined ? String(body.address || "") || null : undefined },
  ];

  const updates: Record<string, string | null> = {};
  for (const field of fields) {
    if (field.value === undefined) continue;
    const oldVal = String((student as Record<string, unknown>)[field.key] ?? "");
    if (oldVal !== String(field.value ?? "")) {
      updates[field.key] = field.value;
      await supabase.from("student_profile_changes").insert({
        student_id: student.id,
        changed_by: profile.id,
        field_name: field.key,
        old_value: oldVal || null,
        new_value: String(field.value ?? "") || null,
      });
    }
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("students").update(updates).eq("id", student.id);
    if (error) return jsonWithCors({ error: error.message }, 400);
  }

  return jsonWithCors({ success: true });
}
