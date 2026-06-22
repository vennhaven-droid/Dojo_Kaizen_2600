import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions-server";

export async function GET(request: Request) {
  try {
    await requirePermission("view_payments");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const studentId = new URL(request.url).searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const { data } = await supabase
    .from("memberships")
    .select("*, programs(name), session_packages(remaining, purchased)")
    .eq("student_id", studentId)
    .eq("status", "ACTIVE")
    .order("start_date", { ascending: false });

  const memberships = (data ?? []).map((m) => {
    const pkg = Array.isArray(m.session_packages) ? m.session_packages[0] : m.session_packages;
    const program = m.programs as { name?: string } | null;
    const rate = Number(m.custom_rate ?? 0);
    return {
      id: m.id,
      type: m.type,
      programName: program?.name ?? "Program",
      dueDate: m.due_date,
      endDate: m.end_date,
      customRate: rate,
      sessionsRemaining: pkg?.remaining ?? null,
      packageExpiry: m.end_date ?? null,
      label: formatMembershipLabel(m.type, program?.name, m.due_date, m.end_date, pkg),
    };
  });

  return NextResponse.json({ memberships });
}

function formatMembershipLabel(
  type: string,
  programName: string | undefined,
  dueDate: string | null,
  endDate: string | null,
  pkg: { remaining?: number } | null | undefined
) {
  const name = programName ?? "Program";
  switch (type) {
    case "MONTHLY":
      return `${name} — Monthly${dueDate ? ` — Due ${dueDate}` : ""}`;
    case "WALK_IN":
      return `${name} — Walk-in (single visit)`;
    case "SESSION_PACKAGE":
      return `${name} — Session package (${pkg?.remaining ?? "?"} left${endDate ? `, exp ${endDate}` : ""})`;
    case "PRIVATE_COACHING":
      return `${name} — Private coaching${endDate ? ` — Until ${endDate}` : ""}`;
    default:
      return `${name} — ${type}${dueDate ? ` — Due ${dueDate}` : ""}`;
  }
}
