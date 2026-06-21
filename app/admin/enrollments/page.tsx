import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions-server";
import { convertEnrollmentLead } from "../students/actions";
import { updateEnrollmentLead } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/portals/portal-shell";
import { formatDate } from "@/lib/utils";

export default async function EnrollmentsPage() {
  await requirePermission("manage_enrollments");
  const supabase = await createClient();
  const { data: leads } = await supabase
    ?.from("enrollment_leads")
    .select("*")
    .order("created_at", { ascending: false }) ?? { data: [] };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Enrollment Applications</h2>
      <div className="overflow-x-auto rounded-xl border border-blue/20">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-blue/20 bg-kaizen-black/50 text-kaizen-muted">
            <tr>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => (
              <tr key={lead.id} className="border-b border-blue/10 align-top">
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{lead.first_name} {lead.last_name}</p>
                  {lead.birthday && <p className="text-xs text-kaizen-muted">DOB: {lead.birthday}</p>}
                </td>
                <td className="px-4 py-3">{lead.program_interest ?? "—"}</td>
                <td className="px-4 py-3">
                  <p>{lead.phone ?? lead.email ?? "—"}</p>
                  {lead.parent_name && (
                    <p className="text-xs text-kaizen-muted">Parent: {lead.parent_name}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3">
                  <details>
                    <summary className="cursor-pointer text-xs text-blue">Update</summary>
                    <form action={updateEnrollmentLead.bind(null, lead.id)} className="mt-2 space-y-2 min-w-[200px]">
                      <select
                        name="status"
                        defaultValue={lead.status}
                        className="w-full rounded-md border border-blue/30 bg-kaizen-black px-2 py-1.5 text-sm"
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="ENROLLED">Enrolled</option>
                        <option value="NOT_PROCEEDING">Not Proceeding</option>
                      </select>
                      <Textarea name="notes" defaultValue={lead.notes ?? ""} rows={2} placeholder="Admin notes" />
                      <Button type="submit" size="sm" variant="outline">
                        Save
                      </Button>
                    </form>
                  </details>
                  {(lead.status === "NEW" || lead.status === "CONTACTED") && (
                    <form action={async () => { "use server"; await convertEnrollmentLead(lead.id); }} className="mt-2">
                      <Button type="submit" size="sm" variant="gold">
                        Convert to student
                      </Button>
                    </form>
                  )}
                  {lead.status === "ENROLLED" && (
                    <Link href="/admin/students/new" className="mt-2 inline-block text-xs text-blue hover:underline">
                      Create student record →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(leads ?? []).length === 0 && (
          <p className="p-8 text-center text-kaizen-muted">No enrollment applications yet.</p>
        )}
      </div>
    </div>
  );
}
