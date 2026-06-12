import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const reports = [
    { type: "revenue", label: "Revenue Report" },
    { type: "attendance", label: "Attendance Report" },
    { type: "memberships", label: "Memberships Report" },
    { type: "students", label: "Students Report" },
    { type: "retention", label: "Retention Report" },
    { type: "lockers", label: "Locker Report" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">Reports & Export</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <div key={r.type} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
            <h3 className="font-display font-bold text-gold">{r.label}</h3>
            <div className="mt-4 flex gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href={`/api/reports/${r.type}?format=csv`}>CSV</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/api/reports/${r.type}?format=json`}>JSON</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
