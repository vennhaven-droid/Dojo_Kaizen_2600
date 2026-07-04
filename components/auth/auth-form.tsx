"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveLoginRedirect } from "@/lib/auth/resolve-login-redirect";
import {
  LOGIN_ERROR_MESSAGES,
  parseLoginPortal,
} from "@/lib/auth-routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginChooser, type LoginPortal } from "@/components/auth/login-chooser";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [portal, setPortal] = useState<LoginPortal>(
    parseLoginPortal(searchParams.get("portal"))
  );
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const errorCode = searchParams.get("error");
    if (errorCode && LOGIN_ERROR_MESSAGES[errorCode]) {
      setError(LOGIN_ERROR_MESSAGES[errorCode]);
    }
  }, [searchParams]);

  async function finishLogin(
    supabase: ReturnType<typeof createClient>,
    userId: string
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", userId)
      .single();

    const redirect = searchParams.get("redirect");
    const result = resolveLoginRedirect(profile, portal, redirect);

    if (!result.ok) {
      await supabase.auth.signOut();
      throw new Error(LOGIN_ERROR_MESSAGES[result.error]);
    }

    router.push(result.path);
    router.refresh();
  }

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

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign-in failed. Please try again.");

      await finishLogin(supabase, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");

    if (!configured) {
      setError("Supabase is not connected. Add your project keys to .env.local.");
      return;
    }

    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const redirect = searchParams.get("redirect");
      const callbackParams = new URLSearchParams({ portal });
      if (redirect && redirect.startsWith("/")) {
        callbackParams.set("next", redirect);
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?${callbackParams.toString()}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setGoogleLoading(false);
    }
  }

  const busy = loading || googleLoading;

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
        <GoogleSignInButton
          onClick={handleGoogleSignIn}
          disabled={!configured}
          loading={googleLoading}
        />
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-blue/20" />
          <span className="text-xs uppercase tracking-wide text-kaizen-muted">or</span>
          <div className="h-px flex-1 bg-blue/20" />
        </div>
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
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
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
          <Button type="submit" className="w-full" variant="gold" disabled={busy}>
            {loading ? "Please wait..." : "Log in with email"}
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
