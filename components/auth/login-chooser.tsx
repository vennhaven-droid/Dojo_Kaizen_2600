"use client";

import { cn } from "@/lib/utils";

export type LoginPortal = "member" | "staff";

export function LoginChooser({
  value,
  onChange,
}: {
  value: LoginPortal;
  onChange: (v: LoginPortal) => void;
}) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg border border-blue/30 bg-kaizen-black/50 p-1">
      <button
        type="button"
        onClick={() => onChange("member")}
        className={cn(
          "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          value === "member"
            ? "bg-gold text-kaizen-black"
            : "text-kaizen-muted hover:text-kaizen-gray"
        )}
      >
        Student / Parent
      </button>
      <button
        type="button"
        onClick={() => onChange("staff")}
        className={cn(
          "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          value === "staff"
            ? "bg-gold text-kaizen-black"
            : "text-kaizen-muted hover:text-kaizen-gray"
        )}
      >
        Coach / Admin
      </button>
    </div>
  );
}

export function roleMatchesPortal(
  role: string | undefined,
  portal: LoginPortal
): boolean {
  if (!role) return false;
  if (portal === "member") return role === "STUDENT" || role === "PARENT";
  return role === "COACH" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function getRouteForRole(role: string | undefined): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
    case "COACH":
      return "/admin";
    case "PARENT":
      return "/parent";
    case "STUDENT":
      return "/student";
    default:
      return "/";
  }
}
