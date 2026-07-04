import { getAuditLogs } from "@/lib/audit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AdminTableShell,
  MobileEmptyState,
  MobileRecordCard,
  ResponsiveTable,
} from "@/components/admin/responsive-list";

export default async function AuditPage() {
  const logs = await getAuditLogs(100);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Audit Logs</h2>

      {logs.length === 0 ? (
        <MobileEmptyState message="No audit logs yet." />
      ) : (
        <ResponsiveTable
          desktop={
            <AdminTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const profile = log.profiles as { first_name?: string; last_name?: string; email?: string } | null;
                    return (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                        <TableCell>{profile?.email ?? profile?.first_name ?? "System"}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.entity_type} {log.entity_id?.slice(0, 8)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AdminTableShell>
          }
          mobile={logs.map((log) => {
            const profile = log.profiles as { first_name?: string; last_name?: string; email?: string } | null;
            const user = profile?.email ?? profile?.first_name ?? "System";
            return (
              <MobileRecordCard
                key={log.id}
                title={log.action}
                subtitle={new Date(log.created_at).toLocaleString()}
                rows={[
                  { label: "User", value: user },
                  {
                    label: "Entity",
                    value: `${log.entity_type} ${log.entity_id?.slice(0, 8) ?? ""}`.trim(),
                  },
                ]}
              />
            );
          })}
        />
      )}
    </div>
  );
}
