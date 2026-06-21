"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  Trophy,
  FileText,
  Settings,
  Lock,
  BarChart3,
  ClipboardList,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { UserRole } from "@/lib/types";
import type { AdminPermissions } from "@/lib/permissions";
import { canSeeNavItem } from "@/lib/permissions";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/enrollments", label: "Enrollments", icon: FileText },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/attendance", label: "Attendance", icon: Calendar },
  { href: "/admin/programs", label: "Programs", icon: ClipboardList },
  { href: "/admin/coaches", label: "Coaches", icon: Users },
  { href: "/admin/staff", label: "Staff", icon: Shield },
  { href: "/admin/lockers", label: "Lockers", icon: Lock },
  { href: "/admin/competitions", label: "Competitions", icon: Trophy },
  { href: "/admin/retention", label: "Retention", icon: BarChart3 },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/cms", label: "Website CMS", icon: Settings },
  { href: "/admin/audit", label: "Audit Logs", icon: FileText },
];

const PARENT_NAV = [
  { href: "/parent", label: "Dashboard", icon: LayoutDashboard },
  { href: "/parent/attendance", label: "Attendance", icon: Calendar },
  { href: "/parent/achievements", label: "Achievements", icon: Trophy },
  { href: "/parent/payments", label: "Payments", icon: CreditCard },
];

const STUDENT_NAV = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/profile", label: "My Profile", icon: UserCircle },
  { href: "/student/attendance", label: "Attendance", icon: Calendar },
  { href: "/student/payments", label: "Payments", icon: CreditCard },
  { href: "/student/achievements", label: "Achievements", icon: Trophy },
  { href: "/student/competitions", label: "Competitions", icon: Trophy },
];

function getNav(role: UserRole, permissions: AdminPermissions | null) {
  if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "COACH") {
    return ADMIN_NAV.filter((item) => canSeeNavItem(item.href, role, permissions));
  }
  if (role === "PARENT") return PARENT_NAV;
  if (role === "STUDENT") return STUDENT_NAV;
  return [];
}

export function PortalShell({
  role,
  title,
  userEmail,
  permissions = null,
  children,
}: {
  role: UserRole;
  title: string;
  userEmail?: string;
  permissions?: AdminPermissions | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = getNav(role, permissions);

  return (
    <div className="flex min-h-screen portal-gradient">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-blue/20 bg-kaizen-black transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-blue/20 px-4">
          <Link href="/" className="font-display text-sm font-bold text-gold">
            DOJO KAIZEN
          </Link>
        </div>
        <nav className="max-h-[calc(100vh-8rem)] space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/parent" &&
                item.href !== "/student" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-blue/20 text-blue" : "text-kaizen-muted hover:bg-blue/10 hover:text-kaizen-gray"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-blue/20 p-3">
          <form action="/api/signout" method="POST">
            <Button type="submit" variant="ghost" className="w-full justify-start gap-3">
              <LogOut className="size-4" /> Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-blue/20 bg-kaizen-black/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              <Menu className="size-5 text-kaizen-gray" />
            </button>
            <h1 className="font-display text-lg font-bold text-kaizen-gray">{title}</h1>
          </div>
          {userEmail && <span className="hidden text-sm text-kaizen-muted sm:inline">{userEmail}</span>}
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  sub,
  variant = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "default" | "gold" | "danger" | "success";
}) {
  const colors = {
    default: "border-blue/30",
    gold: "border-gold/30",
    danger: "border-red-500/30",
    success: "border-green-500/30",
  };
  return (
    <div className={cn("rounded-xl border bg-kaizen-dark p-5", colors[variant])}>
      <p className="text-sm text-kaizen-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-kaizen-gray">{value}</p>
      {sub && <p className="mt-1 text-xs text-kaizen-muted">{sub}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase().replace(/ /g, "_");
  const styles: Record<string, string> = {
    NEW: "bg-gold/20 text-gold border-gold/40",
    CONTACTED: "bg-blue/20 text-blue border-blue/40",
    ENROLLED: "bg-green-500/20 text-green-400 border-green-500/40",
    NOT_PROCEEDING: "bg-kaizen-muted/20 text-kaizen-muted border-kaizen-muted/40",
    READ: "bg-blue/20 text-blue border-blue/40",
    REPLIED: "bg-green-500/20 text-green-400 border-green-500/40",
    CLOSED: "bg-kaizen-muted/20 text-kaizen-muted border-kaizen-muted/40",
    PAID: "bg-green-500/20 text-green-400 border-green-500/40",
    UNPAID: "bg-gold/20 text-gold border-gold/40",
    PARTIAL: "bg-blue/20 text-blue border-blue/40",
    OVERDUE: "bg-red-500/20 text-red-400 border-red-500/40",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase",
        styles[normalized] ?? "border-blue/30 text-kaizen-muted"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
