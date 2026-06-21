import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const REMOVED_ROUTES: Record<string, string> = {
  "/success": "/",
  "/events": "/",
};

const COACH_REDIRECTS: Record<string, string> = {
  "/coach": "/admin",
  "/coach/students": "/admin/students",
  "/coach/attendance": "/admin/attendance",
  "/coach/plans": "/admin/attendance",
  "/coach/time": "/admin",
};

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const proto = request.headers.get("x-forwarded-proto");
  const isProduction = process.env.NODE_ENV === "production";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");

  if (isProduction && !isLocal && proto === "http") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const redirectTo = REMOVED_ROUTES[request.nextUrl.pathname];
  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.url), 308);
  }

  const coachRedirect = COACH_REDIRECTS[request.nextUrl.pathname];
  if (coachRedirect) {
    return NextResponse.redirect(new URL(coachRedirect, request.url), 308);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
