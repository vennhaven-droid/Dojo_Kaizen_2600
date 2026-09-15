import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "hello@dojokaizen2600.com";
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

export async function sendEmail(to: string | string[], subject: string, html: string) {
  const recipients = Array.isArray(to) ? to.join(", ") : to;
  if (!resend) {
    console.warn(`[Email stub] RESEND_API_KEY is not set. To: ${recipients}, Subject: ${subject}`);
    return { success: false, stub: true };
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
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
  return `
    <h1>Welcome to Dojo Kaizen, ${name}!</h1>
    <p>Your account has been created. Log in to track your progress, check in to classes, and view your membership.</p>
    <p>Train hard. Improve daily.</p>
  `;
}

export function paymentReminderEmail(name: string, amount: string, dueDate: string) {
  return `
    <h1>Payment Reminder</h1>
    <p>Hi ${name}, your membership payment of ${amount} is due on ${dueDate}.</p>
    <p>Please visit the front desk or contact us to settle your account.</p>
  `;
}

export function birthdayEmail(name: string) {
  return `
    <h1>Happy Birthday, ${name}!</h1>
    <p>The entire Dojo Kaizen family wishes you an amazing birthday. See you on the mats!</p>
  `;
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
  const extra: string[] = [];
  if (data.birthday) extra.push(`<p>Birthday: ${data.birthday}</p>`);
  if (data.parentName) extra.push(`<p>Parent: ${data.parentName}</p>`);
  if (data.parentPhone) extra.push(`<p>Parent phone: ${data.parentPhone}</p>`);
  if (data.parentEmail) extra.push(`<p>Parent email: ${data.parentEmail}</p>`);
  if (data.emergencyContact) extra.push(`<p>Emergency contact: ${data.emergencyContact}</p>`);
  return `
    <h1>New Enrollment Lead</h1>
    <p><strong>${data.firstName} ${data.lastName}</strong> is interested in ${data.program}.</p>
    <p>Phone: ${data.phone}</p>
    <p>Email: ${data.email}</p>
    ${extra.join("\n    ")}
  `;
}

export function contactFormEmail(data: { name: string; email: string; message: string }) {
  return `
    <h1>Contact Form Submission</h1>
    <p><strong>From:</strong> ${data.name} (${data.email})</p>
    <p>${data.message}</p>
  `;
}
