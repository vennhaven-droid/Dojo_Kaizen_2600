"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ResetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setCheckingSession(false);
      return;
    }

    const supabase = createClient();

    async function verifyRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setHasSession(true);
        setCheckingSession(false);
        return;
      }

      setHasSession(false);
      setCheckingSession(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
        setCheckingSession(false);
      }
    });

    void verifyRecoverySession();

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!configured) {
      setError("Supabase is not connected.");
      return;
    }

    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("This reset link has expired. Request a new one below.");
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      await supabase.auth.signOut();
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-blue/30 bg-kaizen-dark/90 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gold">New Password</CardTitle>
        <CardDescription>Choose a new password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        {checkingSession ? (
          <p className="text-sm text-kaizen-muted">Verifying reset link...</p>
        ) : done ? (
          <p className="rounded-md border border-blue/30 bg-blue/10 px-3.5 py-2.5 text-sm text-kaizen-silver">
            Password updated. Redirecting to login...
          </p>
        ) : !hasSession ? (
          <div className="space-y-4">
            <p className="rounded-md border border-red-400/30 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-300">
              This reset link is invalid or has expired. Request a new password reset email.
            </p>
            <Button asChild variant="gold" className="w-full">
              <Link href="/forgot-password">Request new reset link</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-blue transition-colors hover:text-gold"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full" variant="gold" disabled={loading}>
              {loading ? "Saving..." : "Update password"}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-kaizen-muted">
          <Link href="/login" className="text-blue hover:underline">
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
