import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, enrollmentNotification, contactFormEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { error } = await supabase.from("enrollment_leads").insert({
    first_name: body.first_name,
    last_name: body.last_name,
    birthday: body.birthday,
    email: body.email,
    phone: body.phone,
    program_interest: body.program_interest,
    parent_name: body.parent_name,
    parent_phone: body.parent_phone,
    parent_email: body.parent_email,
    emergency_contact: body.emergency_contact,
    waiver_accepted: body.waiver_accepted ?? false,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "info@dojokaizen.com";
  await sendEmail(
    adminEmail,
    "New Enrollment Lead",
    enrollmentNotification({
      firstName: body.first_name,
      lastName: body.last_name,
      program: body.program_interest,
      phone: body.phone,
    })
  );

  return NextResponse.json({ success: true });
}
