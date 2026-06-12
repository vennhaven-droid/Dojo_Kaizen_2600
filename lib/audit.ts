import { createClient } from "@/lib/supabase/server";

export async function logAudit(input: {
  userId: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
}) {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from("audit_logs").insert({
    user_id: input.userId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    old_value: input.oldValue,
    new_value: input.newValue,
    ip_address: input.ipAddress,
  });
}

export async function getAuditLogs(limit = 50) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("audit_logs")
    .select("*, profiles(first_name, last_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
