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
import type { UserRole } from "@/lib/types";

function getDefaultRoute(role?: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin";
    case "COACH":
      return "/coach";
    case "PARENT":
      return "/parent";
    case "STUDENT":
      return "/student";
    default:
      return "/";
  }
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const configured = isSupabaseConfigured();
  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!configured) {
      setError("Supabase is not connected. Add your project keys to .env.local.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const firstName = String(form.get("first_name") ?? "").trim();
    const lastName = String(form.get("last_name") ?? "").trim();

    setLoading(true);
    try {
      const supabase = createClient();
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` },
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then log in.");
          setLoading(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }

      const redirect = searchParams.get("redirect");
      if (redirect) {
        router.push(redirect);
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
          .single();
        router.push(getDefaultRoute(profile?.role as UserRole));
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <Card className="border-blue/30 bg-kaizen-dark/90 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gold">
          {isSignup ? "Create Account" : "Welcome Back"}
        </CardTitle>
        <CardDescription>
          {isSignup
            ? "Join the Dojo Kaizen community"
            : "Log in to your portal"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!configured && (
          <p className="mb-4 rounded-md border border-gold/40 bg-gold/10 px-3.5 py-2.5 text-xs">
            Demo mode: connect Supabase in .env.local to enable sign in.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" name="first_name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" name="last_name" required />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && <p className="rounded-md border border-blue/30 bg-blue/10 px-3.5 py-2.5 text-sm">{notice}</p>}
          <Button type="submit" className="w-full" variant="gold" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create account" : "Log in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-kaizen-muted">
          {isSignup ? (
            <>Already have an account? <Link href="/login" className="text-blue hover:underline">Log in</Link></>
          ) : (
            <>New here? <Link href="/signup" className="text-blue hover:underline">Create an account</Link></>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
