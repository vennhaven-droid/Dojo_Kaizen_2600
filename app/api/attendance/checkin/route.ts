import { checkInStudent } from "@/lib/attendance";
import { corsPreflight, jsonWithCors } from "@/lib/http/cors";
import {
  canAccessStudentAttendance,
  defaultStudentId,
  getProfileFromRequest,
} from "@/lib/supabase/request-auth";
import type { CheckInMethod } from "@/lib/types";

export function OPTIONS() {
  return corsPreflight();
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

  const method = (body.method as CheckInMethod | undefined) ?? "LOGIN";
  const result = await checkInStudent(studentId, method);
  return jsonWithCors(result, result.success ? 200 : 400);
}

export async function GET(request: Request) {
  const profile = await getProfileFromRequest(request);
  if (!profile || !["SUPER_ADMIN", "ADMIN"].includes(profile.role)) {
    return jsonWithCors({ error: "Unauthorized" }, 401);
  }

  const today = new Date().toISOString().split("T")[0];
  const token = Buffer.from(`${today}:${profile.id}`).toString("base64url");

  return jsonWithCors({
    qrData: `dojo-kaizen://checkin?token=${token}&date=${today}`,
    date: today,
  });
}
