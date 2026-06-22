"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Student = { id: string; first_name: string; last_name: string };

export function ManualAttendanceForm({
  students,
  defaultDate,
  checkInAction,
}: {
  students: Student[];
  defaultDate: string;
  checkInAction: (formData: FormData) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState(defaultDate);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students.slice(0, 15);
    return students
      .filter((s) => `${s.first_name} ${s.last_name}`.toLowerCase().includes(q))
      .slice(0, 15);
  }, [students, query]);

  return (
    <form action={checkInAction} className="space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
      <h3 className="font-display text-lg text-gold">Manual Check-In</h3>
      <div className="space-y-1.5">
        <Label>Search student</Label>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type name…"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Student</Label>
        <select
          name="student_id"
          required
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm"
        >
          <option value="">Select student</option>
          {filtered.map((s) => (
            <option key={s.id} value={s.id}>
              {s.first_name} {s.last_name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>Date</Label>
        <Input name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <Button type="submit" variant="gold">Check in student</Button>
    </form>
  );
}
