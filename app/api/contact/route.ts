import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, contactFormEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  source_page: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const { name, email, message, source_page } = parsed.data;
  const adminEmail = process.env.ADMIN_EMAIL ?? "info@dojokaizen.com";

  const supabase = createAdminClient();
  if (supabase) {
    const { error } = await supabase.from("contact_inquiries").insert({
      name,
      email,
      message,
      source_page: source_page ?? "/contact",
      status: "NEW",
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  await sendEmail(
    adminEmail,
    `Contact from ${name}`,
    contactFormEmail({ name, email, message })
  );

  return NextResponse.json({ success: true });
}
