import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions-server";
import { StatusBadge } from "@/components/portals/portal-shell";
import { formatDate } from "@/lib/utils";
import { updateInquiry } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function InquiriesPage() {
  await requirePermission("view_inquiries");
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    ?.from("contact_inquiries")
    .select("*")
    .order("created_at", { ascending: false }) ?? { data: [] };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Contact Inquiries</h2>
      <div className="overflow-x-auto rounded-xl border border-blue/20">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-blue/20 bg-kaizen-black/50 text-kaizen-muted">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {(inquiries ?? []).map((row) => (
              <tr key={row.id} className="border-b border-blue/10 align-top">
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.created_at)}</td>
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="line-clamp-2 text-kaizen-muted">{row.message}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-blue">Manage</summary>
                    <form action={updateInquiry.bind(null, row.id)} className="mt-3 space-y-2">
                      <div>
                        <Label className="text-xs">Status</Label>
                        <select
                          name="status"
                          defaultValue={row.status}
                          className="mt-1 w-full rounded-md border border-blue/30 bg-kaizen-black px-2 py-1.5 text-sm"
                        >
                          <option value="NEW">New</option>
                          <option value="READ">Read</option>
                          <option value="REPLIED">Replied</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Admin notes</Label>
                        <Textarea name="admin_notes" defaultValue={row.admin_notes ?? ""} rows={2} />
                      </div>
                      <Button type="submit" size="sm" variant="gold">
                        Save
                      </Button>
                    </form>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(inquiries ?? []).length === 0 && (
          <p className="p-8 text-center text-kaizen-muted">No inquiries yet.</p>
        )}
      </div>
    </div>
  );
}
