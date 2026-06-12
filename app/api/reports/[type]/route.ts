import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile || !["SUPER_ADMIN", "ADMIN"].includes(profile.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "csv";

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  let data: Record<string, unknown>[] = [];
  let headers: string[] = [];

  switch (type) {
    case "revenue": {
      const { data: payments } = await supabase
        .from("payments")
        .select("paid_at, amount, method, payment_type, students(first_name, last_name)")
        .order("paid_at", { ascending: false });
      headers = ["date", "student", "amount", "method", "type"];
      data = (payments ?? []).map((p) => {
        const s = p.students as { first_name?: string; last_name?: string } | null;
        return {
          date: p.paid_at,
          student: `${s?.first_name ?? ""} ${s?.last_name ?? ""}`.trim(),
          amount: p.amount,
          method: p.method,
          type: p.payment_type,
        };
      });
      break;
    }
    case "attendance": {
      const { data: attendance } = await supabase
        .from("attendance")
        .select("date, check_in_method, students(first_name, last_name)")
        .order("date", { ascending: false })
        .limit(1000);
      headers = ["date", "student", "method"];
      data = (attendance ?? []).map((a) => {
        const s = a.students as { first_name?: string; last_name?: string } | null;
        return { date: a.date, student: `${s?.first_name ?? ""} ${s?.last_name ?? ""}`.trim(), method: a.check_in_method };
      });
      break;
    }
    case "students": {
      const { data: students } = await supabase.from("students").select("first_name, last_name, status, birthday, phone, email");
      headers = ["first_name", "last_name", "status", "birthday", "phone", "email"];
      data = students ?? [];
      break;
    }
    case "retention": {
      const { data: stats } = await supabase
        .from("student_stats")
        .select("last_visit, total_visits, current_streak, students(first_name, last_name, status)");
      headers = ["student", "last_visit", "total_visits", "streak", "status"];
      data = (stats ?? []).map((s) => {
        const st = s.students as { first_name?: string; last_name?: string; status?: string } | null;
        return {
          student: `${st?.first_name ?? ""} ${st?.last_name ?? ""}`.trim(),
          last_visit: s.last_visit,
          total_visits: s.total_visits,
          streak: s.current_streak,
          status: st?.status,
        };
      });
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }

  if (format === "json") {
    return NextResponse.json(data);
  }

  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}-report.csv"`,
    },
  });
}
