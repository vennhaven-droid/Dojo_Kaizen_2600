import { checkOutStudent } from "@/lib/attendance";
import { corsPreflight, jsonWithCors } from "@/lib/http/cors";
import {
  canAccessStudentAttendance,
  defaultStudentId,
  getProfileFromRequest,
} from "@/lib/supabase/request-auth";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: Request) {
  const profile = await getProfileFromRequest(request);
  if (!profile) {
    return jsonWithCors({ error: "Unauthorized" }, 401);
  }
  return jsonWithCors({ error: "Use POST to check out" }, 405);
}

export async function POST(request: Request) {
  const profile = await getProfileFromRequest(request);
  if (!profile) {
    return jsonWithCors({ error: "Unauthorized" }, 401);
  }
  if (profile.is_active === false) {
    return jsonWithCors({ error: "Account deactivated" }, 403);
  }

  const body = await request.json().catch(() => ({}));
  let studentId = body.student_id as string | undefined;
  if (!studentId) {
    studentId = await defaultStudentId(profile);
  }

  if (!studentId) {
    return jsonWithCors({ error: "Student not found" }, 400);
  }

  const allowed = await canAccessStudentAttendance(profile, studentId);
  if (!allowed) {
    return jsonWithCors({ error: "Forbidden" }, 403);
  }

  const result = await checkOutStudent(studentId);
  return jsonWithCors(result, result.success ? 200 : 400);
}
