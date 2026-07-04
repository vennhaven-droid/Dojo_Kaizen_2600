import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveLoginRedirect } from "@/lib/auth/resolve-login-redirect";
import { parseLoginPortal } from "@/lib/auth-routes";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const portal = parseLoginPortal(searchParams.get("portal"));
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  if (next?.startsWith("/reset-password")) {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  const result = resolveLoginRedirect(profile, portal, next);

  if (!result.ok) {
    await supabase.auth.signOut();
    const loginUrl = new URL(`${origin}/login`);
    loginUrl.searchParams.set("error", result.error);
    loginUrl.searchParams.set("portal", portal);
    if (next?.startsWith("/")) {
      loginUrl.searchParams.set("redirect", next);
    }
    return NextResponse.redirect(loginUrl.toString());
  }

  return NextResponse.redirect(`${origin}${result.path}`);
}
