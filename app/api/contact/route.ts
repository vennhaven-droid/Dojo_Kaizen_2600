import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, contactFormEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const adminEmail = process.env.ADMIN_EMAIL ?? "info@dojokaizen.com";

  await sendEmail(
    adminEmail,
    `Contact from ${body.name}`,
    contactFormEmail({ name: body.name, email: body.email, message: body.message })
  );

  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("notifications").insert({
      subject: `Contact from ${body.name}`,
      body: body.message,
      channel: "EMAIL",
      status: "sent",
      sent_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true });
}
