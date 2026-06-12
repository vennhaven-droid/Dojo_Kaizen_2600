"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/access";
import { logAudit } from "@/lib/audit";
import { recordPayment } from "@/lib/payments";
import { createMembership } from "@/lib/memberships";
import type { PaymentMethod } from "@/lib/types";

export async function recordPaymentAction(formData: FormData) {
  const profile = await requireAdmin();

  const payment = await recordPayment({
    student_id: String(formData.get("student_id")),
    amount: Number(formData.get("amount")),
    method: String(formData.get("method")) as PaymentMethod,
    reference_number: String(formData.get("reference_number") || "") || undefined,
    membership_id: String(formData.get("membership_id") || "") || undefined,
    locker_rental_id: String(formData.get("locker_rental_id") || "") || undefined,
    payment_type: String(formData.get("payment_type") || "membership"),
    notes: String(formData.get("notes") || "") || undefined,
  });

  await logAudit({
    userId: profile.id,
    action: "CREATE",
    entityType: "payment",
    entityId: payment.id,
    newValue: { amount: payment.amount },
  });

  revalidatePath("/admin/payments");
  return payment;
}

export async function createMembershipAction(formData: FormData) {
  const profile = await requireAdmin();

  const membership = await createMembership({
    student_id: String(formData.get("student_id")),
    program_id: String(formData.get("program_id")),
    type: String(formData.get("type")),
    pricing_type: String(formData.get("pricing_type") || "REGULAR"),
    custom_rate: formData.get("custom_rate") ? Number(formData.get("custom_rate")) : undefined,
    due_date: String(formData.get("due_date") || "") || undefined,
    sessions: formData.get("sessions") ? Number(formData.get("sessions")) : undefined,
  });

  await logAudit({
    userId: profile.id,
    action: "CREATE",
    entityType: "membership",
    entityId: membership.id,
  });

  revalidatePath("/admin/students");
  return membership;
}

export async function createLockerAction(formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const { data, error } = await supabase
    .from("lockers")
    .insert({
      number: String(formData.get("number")),
      monthly_fee: Number(formData.get("monthly_fee") || 500),
      status: "AVAILABLE",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logAudit({ userId: profile.id, action: "CREATE", entityType: "locker", entityId: data.id });
  revalidatePath("/admin/lockers");
}

export async function assignLockerAction(formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await createClient();
  if (!supabase) throw new Error("Database not configured");

  const lockerId = String(formData.get("locker_id"));
  const studentId = String(formData.get("student_id"));

  const { data: locker } = await supabase.from("lockers").select("monthly_fee").eq("id", lockerId).single();

  const renewal = new Date();
  renewal.setMonth(renewal.getMonth() + 1);

  await supabase.from("locker_rentals").insert({
    locker_id: lockerId,
    student_id: studentId,
    start_date: new Date().toISOString().split("T")[0],
    renewal_date: renewal.toISOString().split("T")[0],
    monthly_fee: locker?.monthly_fee ?? 500,
    status: "OCCUPIED",
  });

  await supabase.from("lockers").update({ status: "OCCUPIED" }).eq("id", lockerId);

  await logAudit({ userId: profile.id, action: "ASSIGN", entityType: "locker", entityId: lockerId });
  revalidatePath("/admin/lockers");
}

export async function adminCheckInAction(studentId: string) {
  const profile = await requireAdmin();
  const { checkInStudent } = await import("@/lib/attendance");
  const result = await checkInStudent(studentId, "ADMIN_OVERRIDE");
  await logAudit({
    userId: profile.id,
    action: "CHECK_IN",
    entityType: "attendance",
    entityId: studentId,
  });
  revalidatePath("/admin/attendance");
  return result;
}
