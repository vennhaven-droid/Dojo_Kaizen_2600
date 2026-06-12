import { NextResponse } from "next/server";
import { checkInStudent } from "@/lib/attendance";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { getStudentForUser } from "@/lib/access";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  let studentId = body.student_id as string | undefined;

  if (!studentId && profile.role === "STUDENT") {
    const student = await getStudentForUser(profile.id);
    studentId = student?.id;
  }

  if (!studentId) {
    return NextResponse.json({ error: "Student not found" }, { status: 400 });
  }

  const result = await checkInStudent(studentId, body.method ?? "LOGIN");
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || !["SUPER_ADMIN", "ADMIN"].includes(profile.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const token = Buffer.from(`${today}:${profile.id}`).toString("base64url");

  return NextResponse.json({
    qrData: `dojo-kaizen://checkin?token=${token}&date=${today}`,
    date: today,
  });
}
