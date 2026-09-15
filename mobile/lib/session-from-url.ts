import { supabase } from "@/lib/supabase";

function parseAuthUrl(url: string) {
  const normalized = url.replace("#", "?");
  try {
    const parsed = new URL(normalized);
    return {
      code: parsed.searchParams.get("code"),
      accessToken: parsed.searchParams.get("access_token"),
      refreshToken: parsed.searchParams.get("refresh_token"),
      error: parsed.searchParams.get("error_description") || parsed.searchParams.get("error"),
    };
  } catch {
    return { code: null, accessToken: null, refreshToken: null, error: "Invalid sign-in link" };
  }
}

export async function sessionFromUrl(url: string) {
  const { code, accessToken, refreshToken, error } = parseAuthUrl(url);
  if (error) throw new Error(error);

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    return;
  }

  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw sessionError;
  }
}
