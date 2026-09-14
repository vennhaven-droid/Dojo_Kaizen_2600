import { corsPreflight, jsonWithCors } from "@/lib/http/cors";
import { buildMePayload, getProfileFromRequest } from "@/lib/supabase/request-auth";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: Request) {
  const profile = await getProfileFromRequest(request);
  if (!profile) {
    return jsonWithCors({ error: "Unauthorized" }, 401);
  }
  if (profile.is_active === false) {
    return jsonWithCors({ error: "Account deactivated" }, 403);
  }

  const payload = await buildMePayload(profile);
  return jsonWithCors(payload);
}

export async function POST(request: Request) {
  return GET(request);
}
