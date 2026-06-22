import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import { getRouteForRole } from "@/lib/auth-routes";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  const profile = await getCurrentProfile();
  if (profile && profile.is_active !== false) {
    redirect(getRouteForRole(profile.role));
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
