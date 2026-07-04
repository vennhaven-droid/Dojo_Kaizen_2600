"use client";

import { cn } from "@/lib/utils";
import type { LoginPortal } from "@/lib/auth-routes";

export type { LoginPortal };

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
