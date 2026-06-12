import { getAuditLogs } from "@/lib/audit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AuditPage() {
  const logs = await getAuditLogs(100);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Audit Logs</h2>
      <div className="rounded-xl border border-blue/20 bg-kaizen-dark">
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
      </div>
    </div>
  );
}
