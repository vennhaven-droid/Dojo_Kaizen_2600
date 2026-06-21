import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import type { UserRole } from "@/lib/types";

const PROTECTED_PREFIXES = ["/admin", "/coach", "/parent", "/student"];

const ROLE_ROUTES: Record<string, UserRole[]> = {
  "/admin": ["SUPER_ADMIN", "ADMIN", "COACH"],
  "/coach": ["SUPER_ADMIN", "ADMIN", "COACH"],
  "/parent": ["SUPER_ADMIN", "ADMIN", "PARENT"],
  "/student": ["SUPER_ADMIN", "ADMIN", "STUDENT"],
};

function matchProtectedPrefix(path: string): string | undefined {
  return PROTECTED_PREFIXES.find(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const matchedPrefix = matchProtectedPrefix(path);

  if (!user && matchedPrefix) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (user && matchedPrefix) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (profile?.is_active === false) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "deactivated");
      return NextResponse.redirect(url);
    }

    const role = profile?.role as UserRole | undefined;
    const allowed = ROLE_ROUTES[matchedPrefix] ?? [];

    if (role && !allowed.includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = getDefaultRoute(role);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin";
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
