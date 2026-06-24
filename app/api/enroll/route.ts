import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, enrollmentNotification } from "@/lib/email";
import { calculateAge } from "@/lib/utils";

const schema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  birthday: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1).max(30),
  program_interest: z.string().min(1).max(200),
  parent_name: z.string().max(200).nullable().optional(),
  parent_phone: z.string().max(30).nullable().optional(),
  parent_email: z.string().email().nullable().optional(),
  emergency_contact: z.string().max(200).nullable().optional(),
  waiver_accepted: z.literal(true),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all required fields correctly." }, { status: 400 });
  }

  const data = parsed.data;
  const age = calculateAge(data.birthday);
  const isMinor = age !== null && age < 18;

  const parent_name = isMinor ? data.parent_name || null : null;
  const parent_phone = isMinor ? data.parent_phone || null : null;
  const parent_email = isMinor ? data.parent_email || null : null;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { error } = await supabase.from("enrollment_leads").insert({
    first_name: data.first_name,
    last_name: data.last_name,
    birthday: data.birthday,
    email: data.email,
    phone: data.phone,
    program_interest: data.program_interest,
    parent_name,
    parent_phone,
    parent_email,
    emergency_contact: data.emergency_contact || null,
    waiver_accepted: data.waiver_accepted,
    status: "NEW",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "info@dojokaizen.com";
  await sendEmail(
    adminEmail,
    "New Enrollment Lead",
    enrollmentNotification({
      firstName: data.first_name,
      lastName: data.last_name,
      program: data.program_interest,
      phone: data.phone,
      email: data.email,
    })
  );

  return NextResponse.json({ success: true });
}
