"use client";

import { useEffect, useState } from "react";
import { recordPaymentAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Student = { id: string; first_name: string; last_name: string };
type Membership = {
  id: string;
  type: string;
  label: string;
  customRate: number;
  dueDate: string | null;
  endDate: string | null;
  sessionsRemaining: number | null;
};

export function RecordPaymentForm({ students }: { students: Student[] }) {
  const [studentId, setStudentId] = useState("");
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipId, setMembershipId] = useState("");
  const [summary, setSummary] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!studentId) {
      setMemberships([]);
      setMembershipId("");
      setSummary("");
      return;
    }
    fetch(`/api/admin/student-memberships?studentId=${studentId}`)
      .then((r) => r.json())
      .then((data) => setMemberships(data.memberships ?? []))
      .catch(() => setMemberships([]));
  }, [studentId]);

  useEffect(() => {
    const m = memberships.find((x) => x.id === membershipId);
    if (!m) {
      setSummary("");
      return;
    }
    setSummary(m.label);
    if (m.customRate > 0) setAmount(String(m.customRate));
  }, [membershipId, memberships]);

  return (
    <form action={recordPaymentAction} className="space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
      <h3 className="font-display text-lg text-gold">Record Payment</h3>
      <div className="space-y-1.5">
        <Label>Student</Label>
        <select
          name="student_id"
          required
          value={studentId}
          onChange={(e) => {
            setStudentId(e.target.value);
            setMembershipId("");
          }}
          className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm"
        >
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.first_name} {s.last_name}
            </option>
          ))}
        </select>
      </div>

      {memberships.length > 0 && (
        <div className="space-y-1.5">
          <Label>What is being paid</Label>
          <select
            name="membership_id"
            value={membershipId}
            onChange={(e) => setMembershipId(e.target.value)}
            className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm"
          >
            <option value="">One-off / other</option>
            {memberships.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {summary && (
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-3 text-sm">
          <p className="font-semibold text-gold">Paying for</p>
          <p className="text-kaizen-silver">{summary}</p>
        </div>
      )}

      <input type="hidden" name="payment_type" value="membership" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Amount</Label>
          <Input name="amount" type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Amount Paid</Label>
          <Input name="amount_paid" type="number" step="0.01" defaultValue={amount} />
        </div>
        <div className="space-y-1.5">
          <Label>Due Date</Label>
          <Input name="due_date" type="date" />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <select name="payment_status" className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm">
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Method</Label>
          <select name="method" className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm">
            <option value="CASH">Cash</option>
            <option value="GCASH">GCash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CARD">Card</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5"><Label>Reference #</Label><Input name="reference_number" /></div>
      <div className="space-y-1.5"><Label>Notes</Label><Input name="notes" /></div>
      <Button type="submit" variant="gold">Record Payment</Button>
    </form>
  );
}
