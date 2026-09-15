import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions-server";
import { convertEnrollmentLead } from "../students/actions";
import { archiveEnrollmentLead, restoreEnrollmentLead, updateEnrollmentLead } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/portals/portal-shell";
import {
  AdminTableShell,
  MobileEmptyState,
  MobileRecordCard,
  ResponsiveTable,
} from "@/components/admin/responsive-list";
import { formatDate } from "@/lib/utils";

type Lead = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  program_interest: string | null;
  phone: string | null;
  email: string | null;
  parent_name: string | null;
  status: string;
  notes: string | null;
};

function EnrollmentActions({ lead, archived }: { lead: Lead; archived: boolean }) {
  if (archived) {
    return (
      <form action={restoreEnrollmentLead.bind(null, lead.id)}>
        <Button type="submit" size="sm" variant="outline" className="w-full sm:w-auto">
          Restore
        </Button>
      </form>
    );
  }

  return (
    <>
      <details>
        <summary className="cursor-pointer text-xs text-blue">Update</summary>
        <form action={updateEnrollmentLead.bind(null, lead.id)} className="mt-2 space-y-2">
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
        <form action={convertEnrollmentLead.bind(null, lead.id)} className="mt-2">
          <Button type="submit" size="sm" variant="gold" className="w-full sm:w-auto">
            Convert to student
          </Button>
        </form>
      )}
      {lead.status === "ENROLLED" && lead.notes?.includes("Converted to student") && (
        <p className="mt-2 text-xs text-kaizen-muted break-words">{lead.notes}</p>
      )}
      <form action={archiveEnrollmentLead.bind(null, lead.id)} className="mt-2">
        <Button type="submit" size="sm" variant="secondary" className="w-full sm:w-auto">
          Archive
        </Button>
      </form>
    </>
  );
}

export default async function EnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requirePermission("manage_enrollments");
  const { view } = await searchParams;
  const archived = view === "archived";
  const supabase = await createClient();

  let query = supabase?.from("enrollment_leads").select("*").order("created_at", { ascending: false });
  query = archived ? query?.eq("status", "ARCHIVED") : query?.neq("status", "ARCHIVED");
  const { data: leads } = (await query) ?? { data: [] };

  const list = (leads ?? []) as Lead[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Enrollment Applications</h2>
        <div className="flex gap-2">
          <Button asChild size="sm" variant={archived ? "outline" : "gold"}>
            <Link href="/admin/enrollments">Active</Link>
          </Button>
          <Button asChild size="sm" variant={archived ? "gold" : "outline"}>
            <Link href="/admin/enrollments?view=archived">Archived</Link>
          </Button>
        </div>
      </div>

      {list.length === 0 ? (
        <MobileEmptyState
          message={archived ? "No archived enrollment applications." : "No enrollment applications yet."}
        />
      ) : (
        <ResponsiveTable
          desktop={
            <AdminTableShell>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
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
                    {list.map((lead) => (
                      <tr key={lead.id} className="border-b border-blue/10 align-top">
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">
                            {lead.first_name} {lead.last_name}
                          </p>
                          {lead.birthday && (
                            <p className="text-xs text-kaizen-muted">DOB: {lead.birthday}</p>
                          )}
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
                          <EnrollmentActions lead={lead} archived={archived} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminTableShell>
          }
          mobile={list.map((lead) => (
            <MobileRecordCard
              key={lead.id}
              title={`${lead.first_name} ${lead.last_name}`}
              subtitle={lead.birthday ? `DOB: ${lead.birthday}` : formatDate(lead.created_at)}
              badge={<StatusBadge status={lead.status} />}
              rows={[
                { label: "Submitted", value: formatDate(lead.created_at) },
                { label: "Program", value: lead.program_interest ?? "—" },
                {
                  label: "Contact",
                  value: (
                    <>
                      <p>{lead.phone ?? lead.email ?? "—"}</p>
                      {lead.parent_name && (
                        <p className="text-xs text-kaizen-muted">Parent: {lead.parent_name}</p>
                      )}
                    </>
                  ),
                },
              ]}
              footer={<EnrollmentActions lead={lead} archived={archived} />}
            />
          ))}
        />
      )}
    </div>
  );
}
