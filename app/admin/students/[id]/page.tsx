import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { StudentDetailTabs } from "@/components/admin/student-detail-tabs";
import { getStudentMemberships } from "@/lib/memberships";
import { getStudentPayments } from "@/lib/payments";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: student } = await supabase
    ?.from("students")
    .select("*, guardians(*), emergency_contacts(*), student_stats(*), parent_students(profiles(first_name, last_name, email))")
    .eq("id", id)
    .single() ?? { data: null };

  if (!student) notFound();

  const [memberships, payments, { data: attendance }, { data: profileChanges }, { data: studentNotes }] =
    await Promise.all([
      getStudentMemberships(id),
      getStudentPayments(id),
      supabase?.from("attendance").select("*").eq("student_id", id).order("date", { ascending: false }).limit(30) ?? { data: [] },
      supabase?.from("student_profile_changes").select("*").eq("student_id", id).order("created_at", { ascending: false }).limit(20) ?? { data: [] },
      supabase?.from("student_notes").select("*").eq("student_id", id).order("created_at", { ascending: false }) ?? { data: [] },
    ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/students" className="text-sm text-blue hover:underline">← Students</Link>
        <h2 className="font-display text-2xl font-bold">
          {student.first_name} {student.last_name}
        </h2>
        <Badge variant={student.status === "ACTIVE" ? "success" : "muted"}>{student.status}</Badge>
      </div>

      <StudentDetailTabs
        student={student as Record<string, unknown>}
        memberships={memberships as Array<Record<string, unknown>>}
        payments={payments as Array<Record<string, unknown>>}
        attendance={(attendance ?? []) as Array<Record<string, unknown>>}
        profileChanges={(profileChanges ?? []) as Array<Record<string, unknown>>}
        studentNotes={(studentNotes ?? []) as Array<Record<string, unknown>>}
      />
    </div>
  );
}
