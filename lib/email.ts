import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "hello@dojokaizen.com";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[Email stub] To: ${to}, Subject: ${subject}`);
    return { success: true, stub: true };
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { success: true };
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
}) {
  return `
    <h1>New Enrollment Lead</h1>
    <p><strong>${data.firstName} ${data.lastName}</strong> is interested in ${data.program}.</p>
    <p>Phone: ${data.phone}</p>
    <p>Email: ${data.email}</p>
  `;
}

export function contactFormEmail(data: { name: string; email: string; message: string }) {
  return `
    <h1>Contact Form Submission</h1>
    <p><strong>From:</strong> ${data.name} (${data.email})</p>
    <p>${data.message}</p>
  `;
}
