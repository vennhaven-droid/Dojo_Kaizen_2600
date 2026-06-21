import { NextResponse } from "next/server";
import { checkOutStudent } from "@/lib/attendance";
import { getCurrentProfile } from "@/lib/supabase/server";
import { getStudentForUser } from "@/lib/access";

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await getStudentForUser(profile.id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 400 });
  }

  const result = await checkOutStudent(student.id);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
