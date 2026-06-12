import { createClient } from "@/lib/supabase/server";
import { convertEnrollmentLead } from "../students/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function EnrollmentsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    ?.from("enrollment_leads")
    .select("*")
    .order("created_at", { ascending: false }) ?? { data: [] };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Enrollment Leads</h2>
      <div className="space-y-4">
        {(leads ?? []).map((lead) => (
          <div key={lead.id} className="rounded-xl border border-blue/20 bg-kaizen-dark p-6 flex flex-wrap justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">{lead.first_name} {lead.last_name}</h3>
              <p className="text-sm text-kaizen-muted">{lead.program_interest} · {lead.phone}</p>
              <p className="text-xs text-kaizen-muted mt-1">{formatDate(lead.created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={lead.status === "new" ? "gold" : "success"}>{lead.status}</Badge>
              {lead.status === "new" && (
                <form action={async () => { "use server"; await convertEnrollmentLead(lead.id); }}>
                  <Button type="submit" variant="gold" size="sm">Convert to Student</Button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
