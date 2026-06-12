import { createClient } from "@/lib/supabase/server";
import { getRetentionRisk } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function RetentionPage() {
  const supabase = await createClient();
  const { data: stats } = await supabase
    ?.from("student_stats")
    .select("*, students(id, first_name, last_name, status, phone)")
    .order("last_visit", { ascending: true, nullsFirst: true }) ?? { data: [] };

  const active = (stats ?? []).filter((s) => {
    const student = s.students as { status?: string } | null;
    return student?.status === "ACTIVE";
  });

  const buckets = {
    green: [] as typeof active,
    yellow: [] as typeof active,
    orange: [] as typeof active,
    red: [] as typeof active,
  };

  for (const s of active) {
    const risk = getRetentionRisk(s.last_visit);
    buckets[risk].push(s);
  }

  const riskColors = {
    green: "success" as const,
    yellow: "warning" as const,
    orange: "warning" as const,
    red: "danger" as const,
  };

  const followUp = {
    green: "On track — encourage consistency",
    yellow: "Send friendly check-in message",
    orange: "Schedule follow-up call",
    red: "Urgent — personal outreach needed",
  };

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold">Retention Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-4">
        {(["green", "yellow", "orange", "red"] as const).map((risk) => (
          <div key={risk} className="rounded-xl border border-blue/20 bg-kaizen-dark p-4 text-center">
            <Badge variant={riskColors[risk]} className="mb-2 capitalize">{risk}</Badge>
            <p className="text-3xl font-bold">{buckets[risk].length}</p>
            <p className="text-xs text-kaizen-muted mt-1">
              {risk === "green" && "≤7 days"}
              {risk === "yellow" && "8–14 days"}
              {risk === "orange" && "15–30 days"}
              {risk === "red" && "30+ days"}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <h3 className="font-display text-lg text-gold mb-4">At-Risk Students</h3>
        <div className="space-y-3">
          {[...buckets.red, ...buckets.orange, ...buckets.yellow].map((s) => {
            const student = s.students as { id?: string; first_name?: string; last_name?: string; phone?: string } | null;
            const risk = getRetentionRisk(s.last_visit);
            return (
              <div key={s.student_id} className="flex flex-wrap justify-between gap-2 border-b border-blue/10 pb-3 text-sm">
                <div>
                  <Link href={`/admin/students/${student?.id}`} className="font-semibold text-blue hover:underline">
                    {student?.first_name} {student?.last_name}
                  </Link>
                  <p className="text-kaizen-muted">Last visit: {s.last_visit ?? "Never"} · {student?.phone}</p>
                </div>
                <div className="text-right">
                  <Badge variant={riskColors[risk]}>{risk}</Badge>
                  <p className="text-xs text-kaizen-muted mt-1">{followUp[risk]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
