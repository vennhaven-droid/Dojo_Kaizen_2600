import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL ?? "hello@dojokaizen2600.com";
const FROM = FROM_ADDRESS.includes("<")
  ? FROM_ADDRESS
  : `Dojo Kaizen 2600 <${FROM_ADDRESS}>`;
const SITE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://dojokaizen2600.com";
const LOGO_URL = `${SITE}/images/Home/logo.jpg`;

const DEFAULT_ADMIN_EMAILS = [
  "kaidoj0828@gmail.com",
  "jazeline.ispsc@gmail.com",
  "vennhaven@gmail.com",
];

export function getAdminEmails(): string[] {
  const extra = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  return [...new Set([...DEFAULT_ADMIN_EMAILS, ...extra])];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function detailRow(label: string, value: string | null | undefined) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1f2a37;width:140px;font-size:13px;color:#F2C94C;font-weight:600;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #1f2a37;font-size:14px;color:#F4F4F4;">${escapeHtml(value)}</td>
    </tr>`;
}

function brandedLayout(options: {
  title: string;
  introHtml: string;
  rowsHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  text: string;
}) {
  const cta = options.ctaLabel && options.ctaUrl
    ? `<p style="margin:28px 0 8px;">
        <a href="${escapeHtml(options.ctaUrl)}" style="display:inline-block;background:#F2C94C;color:#0B0B0B;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:6px;">
          ${escapeHtml(options.ctaLabel)}
        </a>
      </p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:#0B0B0B;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0B0B;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border:1px solid #0D74D1;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0B0B0B;padding:20px 28px;text-align:center;border-bottom:3px solid #F2C94C;">
              <img src="${LOGO_URL}" alt="Dojo Kaizen 2600" width="72" height="72" style="display:block;margin:0 auto 10px;border-radius:8px;" />
              <p style="margin:0;font-size:18px;font-weight:700;color:#F2C94C;letter-spacing:0.04em;">DOJO KAIZEN 2600</p>
            </td>
          </tr>
          <tr>
            <td style="background:#0D74D1;padding:14px 28px;">
              <h1 style="margin:0;font-size:20px;line-height:1.3;color:#ffffff;">${escapeHtml(options.title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;color:#B8BEC6;font-size:15px;line-height:1.5;">
              ${options.introHtml}
              ${options.rowsHtml ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">${options.rowsHtml}</table>` : ""}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;font-size:12px;line-height:1.5;color:#7a8190;">
              Lower General Luna, Baguio City, Philippines, 2600<br />
              This is an internal academy notice, not a marketing message.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, text: options.text };
}

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  options?: { text?: string; replyTo?: string }
) {
  const recipients = Array.isArray(to) ? to.join(", ") : to;
  if (!resend) {
    console.warn(`[Email stub] RESEND_API_KEY is not set. To: ${recipients}, Subject: ${subject}`);
    return { success: false, stub: true };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text: options?.text,
      replyTo: options?.replyTo,
    });
    if (error) {
      console.error("Email send failed:", error);
      return { success: false, error };
    }
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error };
  }
}

export function welcomeEmail(name: string) {
  return brandedLayout({
    title: `Welcome to Dojo Kaizen, ${name}!`,
    introHtml: `<p style="margin:0 0 12px;color:#F4F4F4;">Your account has been created. Log in to track your progress, check in to classes, and view your membership.</p><p style="margin:0;color:#B8BEC6;">Train hard. Improve daily.</p>`,
    ctaLabel: "Open academy portal",
    ctaUrl: `${SITE}/login`,
    text: `Welcome to Dojo Kaizen, ${name}!\n\nYour account has been created. Log in at ${SITE}/login to track your progress, check in to classes, and view your membership.\n\nTrain hard. Improve daily.`,
  }).html;
}

export function paymentReminderEmail(name: string, amount: string, dueDate: string) {
  return brandedLayout({
    title: "Payment Reminder",
    introHtml: `<p style="margin:0;color:#F4F4F4;">Hi ${escapeHtml(name)}, your membership payment of ${escapeHtml(amount)} is due on ${escapeHtml(dueDate)}.</p><p style="margin:12px 0 0;color:#B8BEC6;">Please visit the front desk or contact us to settle your account.</p>`,
    text: `Hi ${name}, your membership payment of ${amount} is due on ${dueDate}. Please visit the front desk or contact us to settle your account.`,
  }).html;
}

export function birthdayEmail(name: string) {
  return brandedLayout({
    title: `Happy Birthday, ${name}!`,
    introHtml: `<p style="margin:0;color:#F4F4F4;">The entire Dojo Kaizen family wishes you an amazing birthday. See you on the mats!</p>`,
    text: `Happy Birthday, ${name}!\n\nThe entire Dojo Kaizen family wishes you an amazing birthday. See you on the mats!`,
  }).html;
}

export function enrollmentNotification(data: {
  firstName: string;
  lastName: string;
  program: string;
  phone: string;
  email: string;
  birthday?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  parentEmail?: string | null;
  emergencyContact?: string | null;
}) {
  const fullName = `${data.firstName} ${data.lastName}`;
  const rowsHtml = [
    detailRow("Applicant", fullName),
    detailRow("Program", data.program),
    detailRow("Phone", data.phone),
    detailRow("Email", data.email),
    detailRow("Birthday", data.birthday),
    detailRow("Parent", data.parentName),
    detailRow("Parent phone", data.parentPhone),
    detailRow("Parent email", data.parentEmail),
    detailRow("Emergency", data.emergencyContact),
  ].join("");

  const textLines = [
    `New enrollment: ${fullName}`,
    `Program: ${data.program}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    data.birthday ? `Birthday: ${data.birthday}` : null,
    data.parentName ? `Parent: ${data.parentName}` : null,
    data.parentPhone ? `Parent phone: ${data.parentPhone}` : null,
    data.parentEmail ? `Parent email: ${data.parentEmail}` : null,
    data.emergencyContact ? `Emergency: ${data.emergencyContact}` : null,
    "",
    `Open in admin: ${SITE}/admin/enrollments`,
  ].filter((line) => line !== null);

  return brandedLayout({
    title: "New enrollment application",
    introHtml: `<p style="margin:0;color:#F4F4F4;"><strong style="color:#F2C94C;">${escapeHtml(fullName)}</strong> submitted an enrollment for <strong>${escapeHtml(data.program)}</strong>.</p>`,
    rowsHtml,
    ctaLabel: "Open in admin",
    ctaUrl: `${SITE}/admin/enrollments`,
    text: textLines.join("\n"),
  });
}

export function contactFormEmail(data: { name: string; email: string; message: string }) {
  const rowsHtml = [
    detailRow("From", data.name),
    detailRow("Email", data.email),
  ].join("");

  return brandedLayout({
    title: "Contact form message",
    introHtml: `<p style="margin:0 0 12px;color:#F4F4F4;">A visitor sent a message from the website.</p><p style="margin:16px 0 0;padding:14px;background:#0B0B0B;border-left:3px solid #F2C94C;color:#F4F4F4;white-space:pre-wrap;">${escapeHtml(data.message)}</p>`,
    rowsHtml,
    ctaLabel: "Open inquiries",
    ctaUrl: `${SITE}/admin/inquiries`,
    text: `Contact form message\nFrom: ${data.name} (${data.email})\n\n${data.message}\n\nOpen in admin: ${SITE}/admin/inquiries`,
  });
}
