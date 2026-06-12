import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, paymentReminderEmail, birthdayEmail } from "@/lib/email";
import { formatPeso, todayISO } from "@/lib/utils";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const today = todayISO();
  let sent = 0;

  const { data: overdue } = await supabase
    .from("memberships")
    .select("due_date, custom_rate, students(first_name, email, guardians(email)), programs(default_price, name)")
    .eq("status", "ACTIVE")
    .lt("due_date", today);

  for (const m of overdue ?? []) {
    const student = m.students as { first_name?: string; email?: string; guardians?: Array<{ email?: string }> } | null;
    const program = m.programs as { default_price?: number; name?: string } | null;
    const email = student?.email ?? student?.guardians?.[0]?.email;
    if (!email) continue;
    const amount = formatPeso(Number(m.custom_rate ?? program?.default_price ?? 0));
    await sendEmail(email, "Payment Reminder — Dojo Kaizen", paymentReminderEmail(student?.first_name ?? "Student", amount, m.due_date ?? today));
    sent++;
  }

  const monthDay = today.slice(5);
  const { data: birthdays } = await supabase
    .from("students")
    .select("first_name, email, birthday")
    .not("birthday", "is", null);

  for (const s of birthdays ?? []) {
    if (s.birthday?.slice(5) === monthDay && s.email) {
      await sendEmail(s.email, "Happy Birthday from Dojo Kaizen!", birthdayEmail(s.first_name));
      sent++;
    }
  }

  return NextResponse.json({ success: true, emailsSent: sent });
}
