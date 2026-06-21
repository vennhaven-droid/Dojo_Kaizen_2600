"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!configured) {
      setError("Supabase is not connected.");
      return;
    }
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-blue/30 bg-kaizen-dark/90 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gold">Reset Password</CardTitle>
        <CardDescription>We will email you a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="rounded-md border border-blue/30 bg-blue/10 px-3.5 py-2.5 text-sm">
            Check your email for a password reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full" variant="gold" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
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
