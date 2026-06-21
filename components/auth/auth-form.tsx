"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LoginChooser,
  type LoginPortal,
  getRouteForRole,
  roleMatchesPortal,
} from "@/components/auth/login-chooser";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [portal, setPortal] = useState<LoginPortal>(
    searchParams.get("portal") === "staff" ? "staff" : "member"
  );
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!configured) {
      setError("Supabase is not connected. Add your project keys to .env.local.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user?.id ?? "")
        .single();

      if (profile?.is_active === false) {
        await supabase.auth.signOut();
        throw new Error("This account has been deactivated. Contact the dojo.");
      }

      const role = profile?.role as string | undefined;
      if (!roleMatchesPortal(role, portal)) {
        await supabase.auth.signOut();
        throw new Error(
          portal === "member"
            ? "This account is not a student or parent login. Try Coach / Admin."
            : "This account is not staff. Try Student / Parent login."
        );
      }

      const redirect = searchParams.get("redirect");
      router.push(redirect && redirect.startsWith("/") ? redirect : getRouteForRole(role));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <Card className="border-blue/30 bg-kaizen-dark/90 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gold">Welcome Back</CardTitle>
        <CardDescription>Log in to your Dojo Kaizen portal</CardDescription>
      </CardHeader>
      <CardContent>
        {!configured && (
          <p className="mb-4 rounded-md border border-gold/40 bg-gold/10 px-3.5 py-2.5 text-xs">
            Demo mode: connect Supabase in .env.local to enable sign in.
          </p>
        )}
        <LoginChooser value={portal} onChange={setPortal} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-blue hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" variant="gold" disabled={loading}>
            {loading ? "Please wait..." : "Log in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-kaizen-muted">
          Accounts are created by the dojo. Need help?{" "}
          <Link href="/contact" className="text-blue hover:underline">
            Contact us
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
